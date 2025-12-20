import { useEffect, useState } from "react";
import api from "../api/api";
import StudentLiveTracking from "./StudentLiveTracking";
import "../styles/student.css";

export default function RideStatus({ activeRide, setActiveRide, goHome }) {
  const [ride, setRide] = useState(activeRide);

  useEffect(() => {
    if (activeRide) setRide(activeRide);
  }, [activeRide]);

  if (!ride) {
    return <p className="loading-text">Loading ride status...</p>;
  }

  useEffect(() => {
    if (!ride.id) return;

    const fetchStatus = async () => {
      try {
        const res = await api.get(`/ride/status/${ride.id}/`);
        setRide(res.data);
        setActiveRide(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [ride.id]);

  useEffect(() => {
    if (["completed", "cancelled"].includes(ride.status)) {
      setActiveRide(null);
      goHome();
    }
  }, [ride.status]);

  return (
    <div className="ride-status-card fade-in">
      <h2 className="page-title">Ride Status</h2>

      <div className="status-row">
        <span className={`status-pill status-${ride.status}`}>
          {ride.status}
        </span>
      </div>

      {["accepted", "arrived", "ongoing"].includes(ride.status) && (
        <StudentLiveTracking ride={ride} />
      )}
    </div>
  );
}
