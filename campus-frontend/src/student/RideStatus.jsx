import { useEffect, useState } from "react";
import api from "../api/api";
import StudentLiveTracking from "./StudentLiveTracking";

export default function RideStatus({
  activeRide,
  setActiveRide,
  goHome,
}) {
  const [ride, setRide] = useState(activeRide);

  // 🔁 sync with parent
  useEffect(() => {
    if (activeRide) setRide(activeRide);
  }, [activeRide]);

  if (!ride) {
    return <p className="container">Loading ride status...</p>;
  }

  // 🔄 polling (we’ll optimize later)
  useEffect(() => {
    if (!ride.id) return;

    const fetchStatus = async () => {
      try {
        const res = await api.get(`/ride/status/${ride.id}/`);
        setRide(res.data);
        setActiveRide(res.data);
      } catch (err) {
        console.error("Failed to fetch ride status", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [ride.id]);

  // 🧹 cleanup on end
  useEffect(() => {
    if (["completed", "cancelled"].includes(ride.status)) {
      setActiveRide(null);
      goHome();
    }
  }, [ride.status]);

  return (
    <div className="container">
      <h2>Ride Status</h2>
      <p>
        <strong>Status:</strong> {ride.status}
      </p>

      {["accepted", "arrived", "ongoing"].includes(ride.status) && (
        <StudentLiveTracking ride={ride} />
      )}
    </div>
  );
}
