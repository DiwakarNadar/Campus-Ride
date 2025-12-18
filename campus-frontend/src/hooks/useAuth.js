import { useEffect, useState } from "react";
import api from "../api/api";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchMe = async () => {
    try {
      const res = await api.get("/me/");
      setUser(res.data);
    } catch (err) {
      // 🔴 IMPORTANT: STOP HERE
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchMe();
}, []);


  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return { user, setUser, logout, loading };
}
