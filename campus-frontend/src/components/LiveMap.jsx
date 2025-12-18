import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LiveMap({ pickup, driverLocation }) {
  const mapRef = useRef(null);

  // 🔄 Pan map when driver moves
  useEffect(() => {
    if (mapRef.current && driverLocation) {
      mapRef.current.setView(
        [driverLocation.lat, driverLocation.lng],
        mapRef.current.getZoom(),
        { animate: true }
      );
    }
  }, [driverLocation]);

  return (
    <div style={{ height: "400px", marginTop: "16px" }}>
      <MapContainer
        center={[pickup.lat, pickup.lng]}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 📍 Pickup Marker */}
        <Marker position={[pickup.lat, pickup.lng]}>
          <Popup>Pickup Location</Popup>
        </Marker>

        {/* 🚗 Driver Marker */}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]}>
            <Popup>Driver</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
