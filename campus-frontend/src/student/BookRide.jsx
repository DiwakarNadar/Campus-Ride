import { useState } from "react";
import api from "../api/api";

export default function BookRide({
  goBack,
  setActiveRide,
  setView,
}) {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [error, setError] = useState("");

  // 📍 Get current GPS location
  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setPickup({ lat, lng });
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

      // 🔑 Central active ride state
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

      setError(
        typeof msg === "string" ? msg : JSON.stringify(msg)
      );
    }
  };

  return (
    <div className="container">
      <h2>Book Ride</h2>

      {error && <p className="error">{error}</p>}

      <button onClick={getCurrentLocation}>
        📍 Use My Current Location
      </button>

      {pickup && <p>Pickup location set ✔</p>}

      <select
        onChange={(e) => {
          if (!e.target.value) {
            setDrop(null);
          } else {
            const loc = JSON.parse(e.target.value);
            setDrop({
              lat: Number(loc.lat.toFixed(6)),
              lng: Number(loc.lng.toFixed(6)),
            });
          }
        }}
      >
        <option value="">Select Drop Location</option>
        <option value='{"lat":30.768,"lng":76.575}'>Main Gate</option>
        <option value='{"lat":30.769,"lng":76.577}'>Library</option>
        <option value='{"lat":30.767,"lng":76.574}'>Hostel Block</option>
      </select>

      <button onClick={requestRide}>Request Ride</button>
      <button onClick={goBack}>Back</button>
    </div>
  );
}
