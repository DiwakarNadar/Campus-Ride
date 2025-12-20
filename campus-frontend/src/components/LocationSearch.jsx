import { useState, useMemo } from "react";
import cuLocations from "../utils/cuLocations";
import "../styles/locationSearch.css";

export default function LocationSearch({ label, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return cuLocations.filter((loc) =>
      loc.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const handleSelect = (loc) => {
    onSelect({ lat: loc.lat, lng: loc.lng });
    setQuery(loc.name);
    setOpen(false);
  };

  return (
    <div className="location-search">
      <label className="location-label">{label}</label>

      <input
        type="text"
        placeholder="Search inside CU…"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
      />

      {open && query && (
        <ul className="search-results">
          {filtered.length === 0 && (
            <li className="no-result">No locations found</li>
          )}

          {filtered.map((loc, idx) => (
            <li
              key={`${loc.name}-${idx}`}
              onClick={() => handleSelect(loc)}
            >
              📍 {loc.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
