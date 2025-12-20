import { useEffect, useState } from "react";
import BookRide from "./BookRide";
import RideStatus from "./RideStatus";
import SOSButton from "./SOSButton";
import "../styles/student.css";

export default function StudentHome() {
  const [view, setView] = useState("home");
  const [activeRide, setActiveRide] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("activeRide");
    if (saved) {
      setActiveRide(JSON.parse(saved));
      setView("status");
    }
  }, []);

  useEffect(() => {
    if (activeRide) {
      localStorage.setItem("activeRide", JSON.stringify(activeRide));
    } else {
      localStorage.removeItem("activeRide");
    }
  }, [activeRide]);

  if (view === "status" && activeRide) {
    return (
      <RideStatus
        activeRide={activeRide}
        setActiveRide={setActiveRide}
        goHome={() => setView("home")}
      />
    );
  }

  if (view === "book") {
    return (
      <BookRide
        setActiveRide={setActiveRide}
        setView={setView}
        goBack={() => setView("home")}
      />
    );
  }

  return (
    <div className="student-home fade-in">
      <h2 className="page-title">Student Dashboard</h2>

      <div className="student-actions">
        <button className="primary-btn" onClick={() => setView("book")}>
          🚕 Book a Ride
        </button>

        <SOSButton />
      </div>
    </div>
  );
}
