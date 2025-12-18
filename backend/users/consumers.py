import json
from channels.generic.websocket import AsyncWebsocketConsumer

class RideConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.ride_id = self.scope["url_route"]["kwargs"]["ride_id"]
        self.room_group_name = f"ride_{self.ride_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "ride_update",
                "data": data
            }
        )

    async def ride_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))
class SOSConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]

        # Only admin / security can listen
        if not user.is_authenticated or not user.is_staff:
            await self.close()
            return

        self.group_name = "sos_alerts"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def sos_alert(self, event):
        await self.send(text_data=json.dumps(event["data"]))
class BusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.bus_id = self.scope["url_route"]["kwargs"]["bus_id"]
        self.group_name = f"bus_{self.bus_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def bus_location(self, event):
        await self.send(text_data=json.dumps(event["data"]))
