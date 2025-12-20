from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import DriverStatusUpdateSerializer
from .models import User, Bus
from rest_framework import status
from .serializers import (
    RegisterSerializer,
    DriverRegisterSerializer,
    DriverFullSerializer,
    DriverStatusUpdateSerializer,
   DriverLocationUpdateSerializer,
   RideArrivedSerializer,
   RideHistorySerializer,
   RideRequestSerializer,
   SOSCreateSerializer,
   SOSAdminSerializer,
   BusLocationUpdateSerializer,
   BusSerializer

)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .serializers import RideRequestSerializer
from .models import Ride
from rest_framework.views import APIView
# ------------------------
# Student Registration
# ------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = []


# ------------------------
# Driver Registration
# ------------------------
class DriverRegisterView(generics.CreateAPIView):
    serializer_class = DriverRegisterSerializer
    permission_classes = []


# ------------------------
# Driver Profile (GET)
# ------------------------
class DriverProfileView(generics.RetrieveAPIView):
    serializer_class = DriverFullSerializer
    permission_classes = [IsAuthenticated]


    """
    Returns the authenticated user if the user is a driver.

    Raises a PermissionError if the authenticated user is not a driver.
    """
    def get_object(self):
        """
        Get the authenticated user object.

        This method is used by the RetrieveAPIView to get the object
        to be retrieved. If the authenticated user is not a driver,
        this method raises a PermissionError.
        """
        user = self.request.user
        if user.role != "driver":
            raise PermissionError("Only drivers can access this endpoint")
        return user

class DriverStatusUpdateView(generics.UpdateAPIView):
    serializer_class = DriverStatusUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if user.role != "driver":
            raise PermissionError("Only drivers can update status")
        return user.driver_profile


class RideRequestView(generics.CreateAPIView):
    serializer_class = RideRequestSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        # ✅ serializer.create() returns Ride instance
        ride = serializer.save()

        return Response(
            {
                "ride_id": ride.id,
                "status": ride.status,
                "driver_assigned": ride.driver is not None
            },
            status=status.HTTP_201_CREATED
        )

from .models import DriverProfile
from .utils import calculate_distance
from .serializers import NearestDriverSerializer

class NearestDriverView(generics.GenericAPIView):
    serializer_class = NearestDriverSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pickup_lat = float(serializer.validated_data["pickup_lat"])
        pickup_lng = float(serializer.validated_data["pickup_lng"])

        drivers = DriverProfile.objects.filter(
            is_online=True,
            user__is_active=True,
        )

        nearest = None
        min_distance = float("inf")

        for driver in drivers:
            if driver.current_lat is None or driver.current_lng is None:
                continue

            dist = calculate_distance(
                pickup_lat, pickup_lng,
                float(driver.current_lat), float(driver.current_lng)
            )

            if dist < min_distance:
                min_distance = dist
                nearest = driver

        if nearest is None:
            return Response({"message": "No drivers available"}, status=404)

        return Response({
            "driver_id": nearest.user.id,
            "driver_name": nearest.user.name,
            "vehicle_number": nearest.vehicle_number,
            "distance_km": round(min_distance, 2)
        })
from .serializers import AssignDriverSerializer

class AssignDriverView(generics.GenericAPIView):
    serializer_class = AssignDriverSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ride = serializer.save()

        return Response({
            "ride_id": ride.id,
            "student": ride.student.email,
            "driver": ride.driver.email,
            "status": ride.status
        })
from .serializers import DriverRideActionSerializer

class DriverRideActionView(generics.GenericAPIView):
    serializer_class = DriverRideActionSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        ride = serializer.save()

        return Response({
            "ride_id": ride.id,
            "status": ride.status,
            "message": f"Ride {ride.status} by driver."
        })
from .serializers import RideStartSerializer, RideCompleteSerializer

class RideStartView(generics.GenericAPIView):
    serializer_class = RideStartSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        ride = serializer.save()

        return Response({
            "ride_id": ride.id,
            "status": ride.status,
            "message": "Ride started"
        })


class RideCompleteView(generics.GenericAPIView):
    serializer_class = RideCompleteSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        ride = serializer.save()

        return Response({
            "ride_id": ride.id,
            "status": ride.status,
            "message": "Ride completed"
        })
from users.serializers import RideCancelSerializer

class RideCancelView(generics.GenericAPIView):
    serializer_class = RideCancelSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        ride = serializer.save()

        return Response({
            "ride_id": ride.id,
            "status": ride.status,
            "message": "Ride cancelled successfully"
        })
from users.serializers import RideStatusSerializer
class RideStatusView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RideStatusSerializer
    queryset = Ride.objects.all()
    lookup_field = "id"

    def get_object(self):
        ride_id = self.kwargs["id"]
        ride = Ride.objects.get(id=ride_id)

        user = self.request.user

        # Only student who booked it or driver assigned to it can view
        if user.role == "student" and ride.student != user:
            raise PermissionError("You cannot view this ride.")

        if user.role == "driver" and ride.driver != user:
            raise PermissionError("This is not your ride.")

        # Admin/security can access all
        return ride
class DriverLocationUpdateView(generics.GenericAPIView):
    serializer_class = DriverLocationUpdateSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        # 1️⃣ Validate & save driver location
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()

        # 2️⃣ Find driver's active ride (if any)
        active_ride = Ride.objects.filter(
            driver=request.user,
            status__in=["accepted", "arrived", "ongoing"]
        ).last()

        # 3️⃣ Broadcast location via WebSocket (only if ride exists)
        if active_ride:
            channel_layer = get_channel_layer()

            async_to_sync(channel_layer.group_send)(
                f"ride_{active_ride.id}",
                {
                    "type": "ride_update",
                    "data": {
                        "type": "location_update",
                        "lat": str(profile.current_lat),
                        "lng": str(profile.current_lng),
                        "ride_id": active_ride.id,
                    },
                }
            )

        # 4️⃣ Response
        return Response({
            "message": "Location updated successfully",
            "current_lat": str(profile.current_lat),
            "current_lng": str(profile.current_lng),
            "ride_id": active_ride.id if active_ride else None,
        })
class RideArrivedView(generics.GenericAPIView):
    serializer_class = RideArrivedSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        ride = serializer.save()

        return Response({
            "ride_id": ride.id,
            "status": ride.status,
            "message": "Driver arrived at pickup location"
        })

class RideHistoryView(generics.ListAPIView):
    serializer_class = RideHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "student":
            return Ride.objects.filter(student=user).order_by("-created_at")

        if user.role == "driver":
            return Ride.objects.filter(driver=user).order_by("-created_at")

        return Ride.objects.none()
# users/views.py
class SOSCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SOSCreateSerializer(data=request.data)

        if not serializer.is_valid():
            print("❌ SOS VALIDATION ERROR:", serializer.errors)
            return Response(serializer.errors, status=400)

        serializer.save(user=request.user)

        return Response(
            {"message": "SOS sent successfully"},
            status=status.HTTP_201_CREATED
        )



class SOSAdminListView(generics.ListAPIView):
    serializer_class = SOSAdminSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return SOS.objects.none()

        return SOS.objects.filter(is_active=True).order_by("-created_at")
class BusListCreateView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            raise PermissionError("Only admin can create buses")
        serializer.save()
class BusLocationUpdateView(generics.GenericAPIView):
    serializer_class = BusLocationUpdateSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        bus = serializer.save()

        # 🔴 Broadcast via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"bus_{bus.id}",
            {
                "type": "bus_location",
                "data": {
                    "bus_id": bus.id,
                    "bus_number": bus.bus_number,
                    "lat": str(bus.current_lat),
                    "lng": str(bus.current_lng),
                }
            }
        )

        return Response({
            "message": "Bus location updated",
            "bus_id": bus.id
        })
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_staff": user.is_staff,
            "name": user.name
        })