import { useState } from "react";
import api from "../api/api";
import LocationSearch from "../components/LocationSearch";

export default function BookRide({ goBack, setActiveRide, setView }) {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [error, setError] = useState("");

  // 📍 Use GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPickup({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setError("");
      },
      () => setError("Location permission denied")
    );
  };

  // 🚕 Request ride
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

      setActiveRide({
        id: res.data.ride_id,
        status: "pending",
      });

      setView("status");
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data ||
        "Failed to request ride";

      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  return (
    <div className="container">
      <h2>Book Ride</h2>

      {error && <p className="error">{error}</p>}

      <button onClick={getCurrentLocation}>
        📍 Use My Current Location
      </button>

      {pickup && (
        <p className="info-text">Pickup selected ✔</p>
      )}
      {drop && (
        <p className="info-text">Drop selected ✔</p>
      )}

      <LocationSearch
        label="Pickup Location (CU only)"
        onSelect={setPickup}
      />

      <LocationSearch
        label="Drop Location (CU only)"
        onSelect={setDrop}
      />

      <button onClick={requestRide}>Request Ride</button>
      <button onClick={goBack}>Back</button>
    </div>
  );
}
