import { useState } from "react";
import api from "../api/api";
import "../styles/auth.css";

export default function Login({ onSuccess, goRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      const res = await api.post("/login/", { email, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      const me = await api.get("/me/");
      onSuccess(me.data);
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <h2 className="auth-title">Welcome Back 👋</h2>

        {error && <p className="auth-error">{error}</p>}

        <input
          className="auth-input"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="primary-btn" onClick={submit}>
          Login
        </button>

        <div className="auth-links">
          <button className="link-btn" onClick={() => goRegister("student")}>
            Register as Student
          </button>
          <button className="link-btn" onClick={() => goRegister("driver")}>
            Register as Driver
          </button>
        </div>
      </div>
    </div>
  );
}
