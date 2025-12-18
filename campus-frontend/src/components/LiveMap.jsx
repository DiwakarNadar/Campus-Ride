import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🧭 Icons
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
  iconSize: [32, 32],
});

const pickupIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
});

const dropIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149059.png",
  iconSize: [30, 30],
});

export default function LiveMap({ pickup, drop, driverLocation }) {
  const [route, setRoute] = useState([]);
  const driverMarkerRef = useRef(null);

  // 🛣️ Fetch real road route (OSRM)
  useEffect(() => {
    if (!pickup || !drop) return;

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        const coords = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

        setRoute(coords);
      } catch (err) {
        console.error("Route fetch failed", err);
      }
    };

    fetchRoute();
  }, [pickup, drop]);

  // 🚕 Smooth driver movement
  useEffect(() => {
    if (!driverLocation || !driverMarkerRef.current) return;

    const marker = driverMarkerRef.current;
    const prev = marker.getLatLng();
    const next = L.latLng(driverLocation.lat, driverLocation.lng);

    let progress = 0;
    const steps = 20;

    const interval = setInterval(() => {
      progress += 1 / steps;

      const lat = prev.lat + (next.lat - prev.lat) * progress;
      const lng = prev.lng + (next.lng - prev.lng) * progress;

      marker.setLatLng([lat, lng]);

      if (progress >= 1) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, [driverLocation]);

  return (
    <MapContainer
      center={[pickup.lat, pickup.lng]}
      zoom={15}
      style={{ height: "400px", width: "100%", marginTop: "10px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 📍 Pickup */}
      <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />

      {/* 🏁 Drop */}
      {drop && (
        <Marker position={[drop.lat, drop.lng]} icon={dropIcon} />
      )}

      {/* 🛣️ Route */}
      {route.length > 0 && (
        <Polyline positions={route} color="blue" />
      )}

      {/* 🚕 Driver */}
      {driverLocation && (
        <Marker
          position={[driverLocation.lat, driverLocation.lng]}
          icon={driverIcon}
          ref={driverMarkerRef}
        />
      )}
    </MapContainer>
  );
}
