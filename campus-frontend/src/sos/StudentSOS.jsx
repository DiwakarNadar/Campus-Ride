import { useState } from "react";
import api from "../api/api";
import "./sos.css";

export default function StudentSOS() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const sendSOS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setStatus("Sending SOS...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.post("/sos/", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            message,
          });

          setStatus("🚨 SOS sent successfully");
          setMessage("");
        } catch {
          setStatus("❌ Failed to send SOS");
        }
      },
      () => setStatus("❌ Location permission denied")
    );
  };

  return (
    <div className="sos-box">
      <h3>🚨 Emergency SOS</h3>

      <textarea
        placeholder="Optional message (what happened?)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button className="sos-btn" onClick={sendSOS}>
        SEND SOS
      </button>

      {status && <p className="sos-status">{status}</p>}
    </div>
  );
}
