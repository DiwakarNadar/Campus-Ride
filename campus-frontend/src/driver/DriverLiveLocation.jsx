import { useEffect } from "react";
import api from "../api/api";

export default function DriverLiveLocation({ ride }) {
  useEffect(() => {
    if (!ride) return;

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        try {
          await api.patch("/driver/location/", {
            current_lat: lat,
            current_lng: lng,
          });
        } catch (err) {
          console.error("Location update failed", err.response?.data);
        }
      },
      (err) => console.error("GPS error", err),
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [ride]);

  return null; // No UI needed
}
