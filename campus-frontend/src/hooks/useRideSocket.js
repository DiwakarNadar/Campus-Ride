import { useEffect, useRef } from "react";

export default function useRideSocket(rideId, onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!rideId) {
    console.warn("❌ WS not started — rideId missing");
    return;
  }

    const wsUrl = `ws://127.0.0.1:8000/ws/ride/${rideId}/`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("🟢 Student WS connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    socket.onerror = (error) => {
      console.error("🔴 WS error", error);
    };

    socket.onclose = () => {
      console.log("🟡 WS disconnected");
    };

    return () => {
      socket.close();
    };
  }, [rideId]);

  return socketRef;
}
