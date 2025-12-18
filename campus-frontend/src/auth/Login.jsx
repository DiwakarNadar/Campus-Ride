import { useState } from "react";
import api from "../api/api";

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
    <div className="container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={submit}>Login</button>

    <button><p onClick={() => goRegister("student")}>Register as Student</p></button>  
     <button><p onClick={() => goRegister("driver")}>Register as Driver</p></button>  
      
    </div>
  );
}
