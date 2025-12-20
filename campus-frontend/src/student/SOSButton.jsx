import { useState } from "react";
import api from "../api/api";

export default function SOSButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const sendSOS = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = Number(pos.coords.latitude.toFixed(6));
  const lng = Number(pos.coords.longitude.toFixed(6));

  api.post("/sos/", {
    latitude: lat,
    longitude: lng,
    message: "Help needed",
  });
         

          setSent(true);
        } catch (err) {
          setError("Failed to send SOS");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      }
    );
  };

  if (sent) {
    return <p style={{ color: "red" }}>🚨 SOS Sent Successfully</p>;
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}

      <button
        onClick={sendSOS}
        disabled={loading}
        style={{
          background: "#d32f2f",
          color: "white",
          fontWeight: "bold",
        }}
      >
        {loading ? "Sending SOS..." : "🚨 Send SOS"}
      </button>
    </div>
  );
}
