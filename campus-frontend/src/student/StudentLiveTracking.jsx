import { useState } from "react";
import useRideSocket from "../hooks/useRideSocket";
import LiveMap from "../components/LiveMap";
import "../styles/student.css";

export default function StudentLiveTracking({ ride }) {
  const [driverLocation, setDriverLocation] = useState(null);

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
    <div className="live-tracking-card">
      <h3 className="section-title">Driver Live Location</h3>

      {!driverLocation && (
        <p className="muted-text">Waiting for driver location...</p>
      )}

      <div className="map-wrapper">
        <LiveMap
          pickup={{ lat: ride.pickup_lat, lng: ride.pickup_lng }}
          drop={{ lat: ride.drop_lat, lng: ride.drop_lng }}
          driverLocation={driverLocation}
        />
      </div>
    </div>
  );
}
