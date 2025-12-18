import api from "../api/api";

export default function DriverIncomingRide({ ride, onActionComplete }) {
  if (!ride) return null;

  const callAction = async (url, extraData = {}) => {
    try {
      await api.post(url, {
        ride_id: ride.id,
        ...extraData,
      });

      // 🔄 Force refresh after action
      if (onActionComplete) {
        onActionComplete();
      }

    } catch (err) {
      console.error("Driver action failed:", err.response?.data);
      alert("Action failed");
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "16px",
        borderRadius: "8px",
        marginTop: "16px",
      }}
    >
      <h3>Current Ride</h3>

      <p><strong>Ride ID:</strong> {ride.id}</p>
      <p><strong>Student ID:</strong> {ride.student}</p>
      <p>
        <strong>Status:</strong>{" "}
        <span style={{ fontWeight: "bold" }}>{ride.status}</span>
      </p>

      {ride.status === "pending" && (
        <>
          <button
            onClick={() =>
              callAction("/ride/driver-action/", { action: "accept" })
            }
          >
            Accept
          </button>

          <button
            onClick={() =>
              callAction("/ride/driver-action/", { action: "reject" })
            }
          >
            Reject
          </button>
        </>
      )}

      {ride.status === "accepted" && (
        <button onClick={() => callAction("/ride/arrived/")}>
          Arrived at Pickup
        </button>
      )}

      {ride.status === "arrived" && (
        <button onClick={() => callAction("/ride/start/")}>
          Start Ride
        </button>
      )}

      {ride.status === "ongoing" && (
        <button onClick={() => callAction("/ride/complete/")}>
          Complete Ride
        </button>
      )}
    </div>
  );
}
