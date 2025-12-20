import { useState } from "react";
import api from "../api/api";
import LocationSearch from "../components/LocationSearch";
import "../styles/student.css";

export default function BookRide({ goBack, setActiveRide, setView }) {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [error, setError] = useState("");

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickup({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
      },
      () => setError("Location permission denied")
    );
  };

  const requestRide = async () => {
    setError("");
    if (!pickup || !drop) {
      setError("Pickup and drop location required");
      return;
    }

    try {
      const res = await api.post("/ride/request/", {
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        drop_lat: drop.lat,
        drop_lng: drop.lng,
      });

      setActiveRide({ id: res.data.ride_id, status: "pending" });
      setView("status");
    } catch {
      setError("Failed to request ride");
    }
  };

  return (
    <div className="book-ride-card slide-up">
      <h2 className="page-title">Book Ride</h2>

      {error && <p className="error-text">{error}</p>}

      <button className="secondary-btn" onClick={getCurrentLocation}>
        📍 Use My Current Location
      </button>

      <LocationSearch label="Pickup Location" onSelect={setPickup} />
      <LocationSearch label="Drop Location" onSelect={setDrop} />

      <div className="btn-row">
        <button className="primary-btn" onClick={requestRide}>
          Request Ride
        </button>
        <button className="secondary-btn" onClick={goBack}>
          Back
        </button>
      </div>
    </div>
  );
}
