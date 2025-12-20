import Navbar from "./Navbar";
import StudentHome from "../student/StudentHome";
import DriverHome from "../driver/DriverHome";
import AdminSOSList from "../sos/AdminSOSList";
import "../styles/appshell.css";

export default function AppShell({ user, logout }) {
  return (
    <div className="app-shell">
      <Navbar user={user} logout={logout} />

      <main className="app-content fade-in">
        {user.role === "student" && <StudentHome />}
        {user.role === "driver" && <DriverHome />}
        {user.is_staff && <AdminSOSList />}
      </main>
    </div>
  );
}
