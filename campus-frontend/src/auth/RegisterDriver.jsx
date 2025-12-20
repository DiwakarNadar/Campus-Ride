import { useState } from "react";
import api from "../api/api";
import "../styles/auth.css";

export default function RegisterDriver({ back }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      await api.post("/driver/register/", form);
      back();
    } catch {
      setError("Driver registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <h2 className="auth-title">Driver Registration 🚘</h2>

        {error && <p className="auth-error">{error}</p>}

        <input className="auth-input" placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })} />

        <input className="auth-input" type="password" placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })} />

        <input className="auth-input" placeholder="Vehicle Number"
          onChange={e => setForm({ ...form, vehicle_number: e.target.value })} />

        <input className="auth-input" placeholder="License Number"
          onChange={e => setForm({ ...form, license_number: e.target.value })} />

        <div className="btn-row">
          <button className="primary-btn" onClick={submit}>Register</button>
          <button className="secondary-btn" onClick={back}>Back</button>
        </div>
      </div>
    </div>
  );
}
