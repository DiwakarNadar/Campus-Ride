import { useState } from "react";
import useRideSocket from "../hooks/useRideSocket";

export default function StudentLiveTracking({ rideId }) {
  const [driverLocation, setDriverLocation] = useState(null);

  useRideSocket(rideId, (data) => {
    if (data.type === "location_update") {
      setDriverLocation({
        lat: data.lat,
        lng: data.lng,
      });
    }
  });

  return (
    <div className="p-4 border rounded mt-4">
      <h3>Driver Live Location</h3>

      {!driverLocation && <p>Waiting for driver location...</p>}

      {driverLocation && (
        <>
          <p>Lat: {driverLocation.lat}</p>
          <p>Lng: {driverLocation.lng}</p>
        </>
      )}
    </div>
  );
}
