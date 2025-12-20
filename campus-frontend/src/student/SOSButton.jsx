import { useState } from "react";
import api from "../api/api";
import "../styles/student.css";

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
          await api.post("/sos/", {
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            message: "Help needed",
          });
          setSent(true);
        } catch {
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
    return <p className="sos-success">🚨 SOS Sent Successfully</p>;
  }

  return (
    <div className="sos-container">
      {error && <p className="error-text">{error}</p>}

      <button
        className="sos-btn"
        onClick={sendSOS}
        disabled={loading}
      >
        {loading ? "Sending SOS..." : "🚨 Send SOS"}
      </button>
    </div>
  );
}
