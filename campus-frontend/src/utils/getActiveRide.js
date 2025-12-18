export default function getActiveRide(rides) {
  if (!Array.isArray(rides)) return null;

  return rides.find((ride) =>
    ["pending", "accepted", "arrived", "ongoing"].includes(ride.status)
  );
}