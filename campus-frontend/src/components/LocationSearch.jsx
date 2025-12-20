import { useState } from "react";
import cuLocations from "../utils/cuLocations";
import "../styles/locationSearch.css";

export default function LocationSearch({ label, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = cuLocations.filter((loc) =>
    loc.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (loc) => {
    onSelect({ lat: loc.lat, lng: loc.lng });
    setQuery(loc.name);
    setOpen(false);
  };

  return (
    <div className="location-search">
      <label>{label}</label>

      <input
        type="text"
        placeholder="Search inside CU..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && query && (
        <ul className="search-results">
          {filtered.length === 0 && (
            <li className="no-result">No places found</li>
          )}

          {filtered.map((loc) => (
            <li key={loc.name} onClick={() => handleSelect(loc)}>
              📍 {loc.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
