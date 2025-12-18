import { useState } from "react";
import api from "../api/api";

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
    <div className="container">
      <h2>Student Register</h2>
      {error && <p className="error">{error}</p>}

      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />

      <button onClick={submit}>Register</button>
      <button onClick={back}>Back</button>
    </div>
  );
}
