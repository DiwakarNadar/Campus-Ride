import { useState } from "react";
import api from "../api/api";

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
    <div className="container">
      <h2>Driver Register</h2>
      {error && <p className="error">{error}</p>}

      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <input placeholder="Vehicle Number" onChange={e => setForm({ ...form, vehicle_number: e.target.value })} />
      <input placeholder="License Number" onChange={e => setForm({ ...form, license_number: e.target.value })} />

      <button onClick={submit}>Register</button>
      <button onClick={back}>Back</button>
    </div>
  );
}
