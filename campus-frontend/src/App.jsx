import { useState } from "react";
import useAuth from "./hooks/useAuth";

import Login from "./auth/Login";
import RegisterStudent from "./auth/RegisterStudent";
import RegisterDriver from "./auth/RegisterDriver";
import AppShell from "./layout/AppShell";

export default function App() {
  const { user, setUser, logout, loading } = useAuth();
  const [page, setPage] = useState("login");

  if (loading) return <p>Loading...</p>;

  if (!user) {
    if (page === "student") return <RegisterStudent back={() => setPage("login")} />;
    if (page === "driver") return <RegisterDriver back={() => setPage("login")} />;

    return (
      <Login
        onSuccess={setUser}
        goRegister={setPage}
      />
    );
  }

  return <AppShell user={user} logout={logout} />;
}
