from rest_framework import serializers
from .models import User, DriverProfile,SOS,Bus
from django.utils import timezone

# ------------------------
# Student Registration
# ------------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'phone']

    def create(self, validated_data):
        return User.objects.create_user(role="student", **validated_data)


# ------------------------
# Driver Profile Serializer
# ------------------------
class DriverProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = [
            "vehicle_number",
            "license_number",
            "is_online",
            "current_lat",
            "current_lng",
            "rating",
        ]


# ------------------------
# Driver Full Combined Serializer
# ------------------------
class DriverFullSerializer(serializers.ModelSerializer):
    driver_profile = DriverProfileSerializer()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "phone",
            "role",
            "driver_profile",
        ]


# ------------------------
# Driver Registration Serializer
# ------------------------
class DriverRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    vehicle_number = serializers.CharField(write_only=True)
    license_number = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "name", "phone", "vehicle_number", "license_number"]

    def create(self, validated_data):
        vehicle = validated_data.pop("vehicle_number")
        license_no = validated_data.pop("license_number")

        user = User.objects.create_user(
            role="driver",
            **validated_data
        )

        DriverProfile.objects.create(
            user=user,
            vehicle_number=vehicle,
            license_number=license_no,
        )

        return user

class DriverStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = ["is_online"]
        extra_kwargs = {
            "is_online": {"required": True}
        }
from .models import Ride

class RideRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ride
        fields = [
            "pickup_lat",
            "pickup_lng",
            "drop_lat",
            "drop_lng",
        ]

    def create(self, validated_data):
        from .models import DriverProfile
        from .utils import calculate_distance

        user = self.context["request"].user

        # 1️⃣ Role check
        if user.role != "student":
            raise serializers.ValidationError(
                "Only students can request rides."
            )

        # 🔒 2️⃣ PREVENT MULTIPLE ACTIVE RIDES (PHASE 4.6)
        existing_ride = Ride.objects.filter(
            student=user,
            status__in=["pending", "accepted", "arrived", "ongoing"]
        ).first()

        if existing_ride:
            raise serializers.ValidationError(
                "You already have an active ride."
            )

        # 3️⃣ Create ride
        ride = Ride.objects.create(
            student=user,
            status="pending",
            **validated_data
        )

        # 4️⃣ Find nearest online driver
        drivers = DriverProfile.objects.filter(
            is_online=True,
            current_lat__isnull=False,
            current_lng__isnull=False,
        )

        nearest_driver = None
        min_distance = float("inf")

        for driver in drivers:
            dist = calculate_distance(
                float(ride.pickup_lat),
                float(ride.pickup_lng),
                float(driver.current_lat),
                float(driver.current_lng),
            )

            if dist < min_distance:
                min_distance = dist
                nearest_driver = driver

        # 5️⃣ Assign driver if found
        if nearest_driver:
            ride.driver = nearest_driver.user
            ride.save()

        return ride


class NearestDriverSerializer(serializers.Serializer):
    pickup_lat = serializers.DecimalField(max_digits=9, decimal_places=6)
    pickup_lng = serializers.DecimalField(max_digits=9, decimal_places=6)


class AssignDriverSerializer(serializers.Serializer):
    ride_id = serializers.IntegerField()
    driver_id = serializers.IntegerField()

    def validate(self, data):
        from .models import Ride, User

        try:
            ride = Ride.objects.get(id=data["ride_id"])
        except Ride.DoesNotExist:
            raise serializers.ValidationError("Invalid ride_id")

        try:
            driver = User.objects.get(id=data["driver_id"], role="driver")
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid driver_id")

        if ride.driver is not None:
            raise serializers.ValidationError("Driver already assigned to this ride.")

        data["ride"] = ride
        data["driver"] = driver
        return data

    def save(self, **kwargs):
        ride = self.validated_data["ride"]
        driver = self.validated_data["driver"]

        ride.driver = driver
        ride.status = "pending"     # waiting driver acceptance
        ride.save()

        return ride
class DriverRideActionSerializer(serializers.Serializer):
    ride_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=["accept", "reject"])

    def validate(self, data):
        from .models import Ride

        try:
            ride = Ride.objects.get(id=data["ride_id"])
        except Ride.DoesNotExist:
            raise serializers.ValidationError("Invalid ride_id")

        user = self.context["request"].user

        if user.role != "driver":
            raise serializers.ValidationError("Only drivers can perform this action.")

        if ride.driver != user:
            raise serializers.ValidationError("This ride is not assigned to this driver.")

        if ride.status != "pending":
            raise serializers.ValidationError("Ride is not in pending state.")

        data["ride"] = ride
        data["driver"] = user
        return data

    def save(self):
        ride = self.validated_data["ride"]
        action = self.validated_data["action"]

        from datetime import datetime

        if action == "accept":
            ride.status = "accepted"
            ride.accepted_at = datetime.now()
        else:
            ride.status = "cancelled"
            ride.cancelled_at = datetime.now()

        ride.save()
        return ride
class RideStartSerializer(serializers.Serializer):
    ride_id = serializers.IntegerField()

    def validate(self, data):
        user = self.context["request"].user

        if user.role != "driver":
            raise serializers.ValidationError("Only drivers can start rides")

        try:
            ride = Ride.objects.get(id=data["ride_id"])
        except Ride.DoesNotExist:
            raise serializers.ValidationError("Ride not found")

        if ride.driver != user:
            raise serializers.ValidationError("This is not your ride")

        if ride.status != "arrived":
            raise serializers.ValidationError("Ride must be arrived before starting")

        data["ride"] = ride
        return data

    def save(self):
        ride = self.validated_data["ride"]
        ride.status = "ongoing"
        ride.started_at = timezone.now()
        ride.save()
        return ride

class RideCompleteSerializer(serializers.Serializer):
    ride_id = serializers.IntegerField()

    def validate(self, data):
        user = self.context["request"].user

        ride = Ride.objects.get(id=data["ride_id"])

        if ride.driver != user:
            raise serializers.ValidationError("Not your ride")

        if ride.status != "ongoing":
            raise serializers.ValidationError("Ride not ongoing")

        data["ride"] = ride
        return data

    def save(self):
        ride = self.validated_data["ride"]
        ride.status = "completed"
        ride.completed_at = timezone.now()
        ride.save()
        return ride

class RideCancelSerializer(serializers.Serializer):
    ride_id = serializers.IntegerField()

    def validate(self, data):
        from .models import Ride
        ride_id = data["ride_id"]

        try:
            ride = Ride.objects.get(id=ride_id)
        except Ride.DoesNotExist:
            raise serializers.ValidationError("Invalid ride_id")

        user = self.context["request"].user

        # If cancelled already
        if ride.status == "cancelled":
            raise serializers.ValidationError("Ride is already cancelled")

        # STUDENT CANCELLATION
        if user.role == "student":
            if ride.student != user:
                raise serializers.ValidationError("You did not book this ride.")

            if ride.status in ["ongoing", "completed"]:
                raise serializers.ValidationError("You cannot cancel an active or completed ride.")

        # DRIVER CANCELLATION
        if user.role == "driver":
            if ride.driver != user:
                raise serializers.ValidationError("You are not assigned to this ride.")

            if ride.status in ["ongoing", "completed"]:
                raise serializers.ValidationError("You cannot cancel an active or completed ride.")

        data["ride"] = ride
        data["user"] = user
        return data

    def save(self):
        from datetime import datetime

        ride = self.validated_data["ride"]
        user = self.validated_data["user"]

        ride.status = "cancelled"
        ride.cancelled_at = datetime.now()
        ride.save()

        return ride
class RideStatusSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    driver = serializers.SerializerMethodField()

    class Meta:
        model = Ride
        fields = [
            "id",
            "status",
            "pickup_lat",
            "pickup_lng",
            "drop_lat",
            "drop_lng",
            "created_at",
            "accepted_at",
            "started_at",
            "completed_at",
            "cancelled_at",
            "student",
            "driver"
        ]

    def get_student(self, obj):
        return {
            "id": obj.student.id,
            "name": obj.student.name,
            "email": obj.student.email,
            "phone": obj.student.phone
        }

    def get_driver(self, obj):
        if obj.driver is None:
            return None

        return {
            "id": obj.driver.id,
            "name": obj.driver.name,
            "email": obj.driver.email,
            "phone": obj.driver.phone
        }
class DriverLocationUpdateSerializer(serializers.Serializer):
    current_lat = serializers.DecimalField(max_digits=9, decimal_places=6)
    current_lng = serializers.DecimalField(max_digits=9, decimal_places=6)

    def validate(self, data):
        user = self.context["request"].user

        if user.role != "driver":
            raise serializers.ValidationError("Only drivers can update location.")

        return data

    def save(self):
        user = self.context["request"].user
        profile = user.driver_profile

        profile.current_lat = self.validated_data["current_lat"]
        profile.current_lng = self.validated_data["current_lng"]
        profile.save()

        return profile
class RideArrivedSerializer(serializers.Serializer):
    ride_id = serializers.IntegerField()

    def validate(self, data):
        from .models import Ride

        try:
            ride = Ride.objects.get(id=data["ride_id"])
        except Ride.DoesNotExist:
            raise serializers.ValidationError("Invalid ride_id")

        user = self.context["request"].user

        if user.role != "driver":
            raise serializers.ValidationError("Only drivers can mark arrival.")

        if ride.driver != user:
            raise serializers.ValidationError("You are not assigned to this ride.")

        if ride.status != "accepted":
            raise serializers.ValidationError("Ride must be accepted before arrival.")

        data["ride"] = ride
        return data

    def save(self):
        ride = self.validated_data["ride"]
        ride.status = "arrived"
        ride.save()
        return ride
class RideHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Ride
        fields = [
            "id",
            "status",
            "pickup_lat",
            "pickup_lng",
            "drop_lat",
            "drop_lng",
            "created_at",
            "accepted_at",
            "started_at",
            "completed_at",
            "cancelled_at",
        ]
class SOSCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOS
        fields = ["latitude", "longitude", "message"]

class SOSAdminSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = SOS
        fields = "__all__"

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "email": obj.user.email,
            "role": obj.user.role,
        }
class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = "__all__"


class BusLocationUpdateSerializer(serializers.Serializer):
    bus_id = serializers.IntegerField()
    current_lat = serializers.DecimalField(max_digits=9, decimal_places=6)
    current_lng = serializers.DecimalField(max_digits=9, decimal_places=6)

    def validate(self, data):
        try:
            bus = Bus.objects.get(id=data["bus_id"])
        except Bus.DoesNotExist:
            raise serializers.ValidationError("Invalid bus ID")

        data["bus"] = bus
        return data

    def save(self):
        bus = self.validated_data["bus"]
        bus.current_lat = self.validated_data["current_lat"]
        bus.current_lng = self.validated_data["current_lng"]
        bus.is_active = True
        bus.save()
        return bus
