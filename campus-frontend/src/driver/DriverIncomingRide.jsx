import api from "../api/api";
import "../styles/driver.css";

export default function DriverIncomingRide({ ride, onActionComplete }) {
  if (!ride) return null;

  const callAction = async (url, extraData = {}) => {
    try {
      await api.post(url, {
        ride_id: ride.id,
        ...extraData,
      });

      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error("Driver action failed:", err.response?.data);
      alert("Action failed");
    }
  };

  return (
    <div className="ride-card slide-up">
      <h3 className="section-title">Current Ride</h3>

      <div className="ride-info">
        <p><strong>Ride ID:</strong> {ride.id}</p>
        <p><strong>Student ID:</strong> {ride.student}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={`status-pill status-${ride.status}`}>
            {ride.status}
          </span>
        </p>
      </div>

      <div className="driver-actions">
        {ride.status === "pending" && (
          <>
            <button
              className="accept-btn"
              onClick={() =>
                callAction("/ride/driver-action/", { action: "accept" })
              }
            >
              Accept
            </button>

            <button
              className="reject-btn"
              onClick={() =>
                callAction("/ride/driver-action/", { action: "reject" })
              }
            >
              Reject
            </button>
          </>
        )}

        {ride.status === "accepted" && (
          <button
            className="primary-btn"
            onClick={() => callAction("/ride/arrived/")}
          >
            Arrived at Pickup
          </button>
        )}

        {ride.status === "arrived" && (
          <button
            className="primary-btn"
            onClick={() => callAction("/ride/start/")}
          >
            Start Ride
          </button>
        )}

        {ride.status === "ongoing" && (
          <button
            className="complete-btn"
            onClick={() => callAction("/ride/complete/")}
          >
            Complete Ride
          </button>
        )}
      </div>
    </div>
  );
}
