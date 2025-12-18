from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

# ------------------------
# Custom User Manager
# ------------------------
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, role="student", **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)

        user = self.model(email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, role="admin_security", **extra_fields)


# ------------------------
# Custom User Model
# ------------------------
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("student", "Student"),
        ("driver", "Driver"),
        ("admin_security", "Admin/Security"),
    )

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"


# ------------------------
# Driver Profile Model
# ------------------------
class DriverProfile(models.Model):
    user = models.OneToOneField("users.User", on_delete=models.CASCADE, related_name="driver_profile")
    vehicle_number = models.CharField(max_length=50, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    is_online = models.BooleanField(default=False)
    current_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"DriverProfile({self.user.email})"

from django.conf import settings

class Ride(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("arrived", "Driver Arrived"),
        ("ongoing", "Ride Started"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_rides"
    )

    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="driver_rides"
    )

    pickup_lat = models.DecimalField(max_digits=9, decimal_places=6)
    pickup_lng = models.DecimalField(max_digits=9, decimal_places=6)
    drop_lat = models.DecimalField(max_digits=9, decimal_places=6)
    drop_lng = models.DecimalField(max_digits=9, decimal_places=6)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Ride #{self.id} - {self.student.email} ({self.status})"
from django.conf import settings
from django.db import models


class SOS(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    message = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"SOS #{self.id} - {self.user.email}"
class Bus(models.Model):
    bus_number = models.CharField(max_length=20, unique=True)
    route_name = models.CharField(max_length=100)

    current_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    is_active = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.bus_number} - {self.route_name}"
