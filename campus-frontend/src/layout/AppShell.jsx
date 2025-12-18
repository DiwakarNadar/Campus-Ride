import Navbar from "./Navbar";
import StudentHome from "../student/StudentHome";
import DriverHome from "../driver/DriverHome";
// import AdminSOSList from "../sos/AdminSOSList";

export default function AppShell({ user, logout }) {
  return (
    <>
      <Navbar user={user} logout={logout} />
      {user.role === "student" && <StudentHome />}
      {user.role === "driver" && <DriverHome />}
      {/* {user.is_staff && <AdminSOSList />} */}
    </>
  );
}
