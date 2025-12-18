from django.urls import path
from .views import (
    RegisterView,
    DriverRegisterView,
    DriverProfileView,
    DriverStatusUpdateView,
    RideRequestView,
    NearestDriverView,
    AssignDriverView,
    DriverRideActionView,
    RideStartView,
    RideCompleteView,
    RideCancelView,
    RideStatusView,
    DriverLocationUpdateView,
    RideArrivedView,
    RideHistoryView,
    SOSCreateView,
    SOSAdminListView,
    BusLocationUpdateView,
    BusListCreateView,
    MeView
    
)
       
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("driver/register/", DriverRegisterView.as_view(), name="driver_register"),
    path("driver/profile/", DriverProfileView.as_view(), name="driver_profile"),
    path("driver/status/", DriverStatusUpdateView.as_view(), name="driver_status"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("ride/request/", RideRequestView.as_view(), name="ride_request"),
    path("ride/nearest-driver/", NearestDriverView.as_view(), name="nearest_driver"),
    path("ride/driver-action/", DriverRideActionView.as_view(), name="driver_ride_action"),
    path("ride/start/", RideStartView.as_view(), name="ride_start"),
    path("ride/complete/", RideCompleteView.as_view(), name="ride_complete"),
    path("ride/cancel/", RideCancelView.as_view(), name="ride_cancel"),
    path("ride/status/<int:id>/", RideStatusView.as_view(), name="ride_status"),
    path("driver/location/", DriverLocationUpdateView.as_view(), name="driver_location_update"),
    path("ride/arrived/", RideArrivedView.as_view(), name="ride_arrived"),
    path("ride/history/", RideHistoryView.as_view(), name="ride_history"),
    path("sos/", SOSCreateView.as_view(), name="sos"),
    path("admin/sos/", SOSAdminListView.as_view(), name="sos_admin_list"),
    path("bus/", BusListCreateView.as_view(), name="bus_list_create"),
    path("bus/location/", BusLocationUpdateView.as_view(), name="bus_location_update"),
    path("me/", MeView.as_view(), name="me"),


]