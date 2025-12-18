import { useEffect, useState } from "react";
import api from "../api/api";
import DriverIncomingRide from "./DriverIncomingRide";
import DriverLiveLocation from "./DriverLiveLocation";

export default function DriverHome() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  // Poll for incoming ride only if online
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
      const activeRide = res.data.find(
  (r) =>
    r.status === "pending" ||
    r.status === "accepted" ||
    r.status === "arrived" ||
    r.status === "ongoing"
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
    <div className="container">
      <h2>Driver Dashboard</h2>

      {error && <p className="error">{error}</p>}

      <button
        onClick={toggleStatus}
        style={{
          background: isOnline ? "#e53935" : "#43a047",
          color: "white",
          marginBottom: "16px",
        }}
      >
        {isOnline ? "Go Offline" : "Go Online"}
      </button>

      <p>
        Status:{" "}
        <strong style={{ color: isOnline ? "green" : "red" }}>
          {isOnline ? "Online" : "Offline"}
        </strong>
      </p>

      {currentRide ? (
       <DriverIncomingRide
  ride={currentRide}
  onActionComplete={fetchCurrentRide}

/>
      ) : (
        <p>No active ride</p>
      )}
      
    {currentRide && (
  <DriverLiveLocation ride={currentRide} />
)}
    </div>
  );
}
