import { useEffect, useState } from "react";
import api from "../api/api";
import DriverIncomingRide from "./DriverIncomingRide";
import DriverLiveLocation from "./DriverLiveLocation";
import "../styles/driver.css";

export default function DriverHome() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  useEffect(() => {
    if (!isOnline) return;

    fetchCurrentRide();
    const interval = setInterval(fetchCurrentRide, 5000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const fetchDriverProfile = async () => {
    try {
      const res = await api.get("/driver/profile/");
      setIsOnline(res.data.is_online);
    } catch {
      setError("Failed to load driver profile");
    }
  };

  const fetchCurrentRide = async () => {
    try {
      const res = await api.get("/ride/history/");
      const activeRide = res.data.find((r) =>
        ["pending", "accepted", "arrived", "ongoing"].includes(r.status)
      );
      setCurrentRide(activeRide || null);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async () => {
    try {
      const res = await api.patch("/driver/status/", {
        is_online: !isOnline,
      });
      setIsOnline(res.data.is_online);
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <div className="driver-dashboard fade-in">
      <h2 className="page-title">Driver Dashboard</h2>

      {error && <p className="error-text">{error}</p>}

      <div className="driver-status-card">
        <button
          className={`status-toggle ${isOnline ? "offline" : "online"}`}
          onClick={toggleStatus}
        >
          {isOnline ? "Go Offline" : "Go Online"}
        </button>

        <p className="driver-status">
          Status:
          <span className={`status-indicator ${isOnline ? "green" : "red"}`}>
            {isOnline ? " Online" : " Offline"}
          </span>
        </p>
      </div>

      {currentRide ? (
        <>
          <DriverIncomingRide
            ride={currentRide}
            onActionComplete={fetchCurrentRide}
          />
          <DriverLiveLocation ride={currentRide} />
        </>
      ) : (
        <p className="muted-text">No active ride</p>
      )}
    </div>
  );
}
