import { useEffect } from "react";
import api from "../api/api";

export default function DriverLiveLocation({ ride }) {
  useEffect(() => {
    if (!ride || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await api.patch("/driver/location/", {
            current_lat: Number(pos.coords.latitude.toFixed(6)),
            current_lng: Number(pos.coords.longitude.toFixed(6)),
          });
        } catch (err) {
          console.error(err);
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [ride]);

  return null;
}
