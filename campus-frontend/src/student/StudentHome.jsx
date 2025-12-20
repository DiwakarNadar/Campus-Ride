import { useEffect, useState } from "react";
import BookRide from "./BookRide";
import RideStatus from "./RideStatus";
import SOSButton from "./SOSButton";


export default function StudentHome() {
  const [view, setView] = useState("home");
  const [activeRide, setActiveRide] = useState(null);

  // restore on refresh
  useEffect(() => {
    const saved = localStorage.getItem("activeRide");
    if (saved) {
      setActiveRide(JSON.parse(saved));
      setView("status");
    }
  }, []);

  // persist
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
    <div className="container">
      <h2>Student Home</h2>

      <button onClick={() => setView("book")}>
        🚕 Book Ride
      </button>

      <SOSButton />

    </div>
  );
}
