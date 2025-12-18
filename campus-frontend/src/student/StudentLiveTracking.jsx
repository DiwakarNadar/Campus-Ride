import { useState } from "react";
import useRideSocket from "../hooks/useRideSocket";
import LiveMap from "../components/LiveMap";

export default function StudentLiveTracking({ ride }) {
  const [driverLocation, setDriverLocation] = useState(null);

  // 🛑 guard
  if (!ride) return null;

  useRideSocket(ride.id, (data) => {
    if (data.type === "location_update") {
      setDriverLocation({
        lat: Number(data.lat),
        lng: Number(data.lng),
      });
    }
  });

  return (
    <div className="mt-4">
      <h3>Driver Live Location</h3>

      {!driverLocation && (
        <p>Waiting for driver location...</p>
      )}

      <LiveMap
        pickup={{
          lat: ride.pickup_lat,
          lng: ride.pickup_lng,
        }}
        driverLocation={driverLocation}
      />
    </div>
  );
}
