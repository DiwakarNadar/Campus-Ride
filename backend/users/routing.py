from django.urls import path
from .consumers import RideConsumer, SOSConsumer, BusConsumer

websocket_urlpatterns = [
    path("ws/ride/<int:ride_id>/", RideConsumer.as_asgi()),
    path("ws/sos/", SOSConsumer.as_asgi()),
    path("ws/bus/<int:bus_id>/", BusConsumer.as_asgi()),

]
