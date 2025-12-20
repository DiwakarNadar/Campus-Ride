import { useEffect, useState } from "react";
import api from "../api/api";

export default function AdminSOSList() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetchSOS();
    const interval = setInterval(fetchSOS, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSOS = async () => {
    try {
      const res = await api.get("/admin/sos/");
      setList(res.data);
    } catch (err) {
      console.error("Failed to fetch SOS");
    }
  };

  return (
    <div className="container">
      <h2>🚨 Active SOS Alerts</h2>

      {list.length === 0 && <p>No active SOS</p>}

      {list.map((sos) => (
        <div key={sos.id} className="card">
          <p><strong>User:</strong> {sos.user.email}</p>
          <p><strong>Message:</strong> {sos.message}</p>
          <p>
            <strong>Location:</strong>{" "}
            {sos.latitude}, {sos.longitude}
          </p>
          <p><strong>Time:</strong> {new Date(sos.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
