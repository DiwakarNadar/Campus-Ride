import { useState } from "react";
import api from "../api/api";
import "../styles/auth.css";

export default function RegisterStudent({ back }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      await api.post("/register/", form);
      back();
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <h2 className="auth-title">Student Registration 🎓</h2>

        {error && <p className="auth-error">{error}</p>}

        <input className="auth-input" placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })} />

        <input className="auth-input" type="password" placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })} />

        <input className="auth-input" placeholder="Name"
          onChange={e => setForm({ ...form, name: e.target.value })} />

        <div className="btn-row">
          <button className="primary-btn" onClick={submit}>Register</button>
          <button className="secondary-btn" onClick={back}>Back</button>
        </div>
      </div>
    </div>
  );
}
