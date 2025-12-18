from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    list_display = ("email", "name", "role", "is_staff", "is_superuser")
    list_filter = ("role", "is_staff", "is_superuser")
    search_fields = ("email", "name", "phone")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("name", "phone", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "role"),
        }),
    )

admin.site.register(User, UserAdmin)
from .models import DriverProfile

@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "vehicle_number", "license_number", "is_online", "rating", "created_at")
    search_fields = ("user__email", "vehicle_number", "license_number")
    list_filter = ("is_online", "is_active")

from .models import Ride

@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "driver", "status", "created_at")
    list_filter = ("status",)