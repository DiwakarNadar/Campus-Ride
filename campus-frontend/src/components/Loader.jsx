import "../styles/loader.css";

export default function Loader({ text = "Loading Campus Ride..." }) {
  return (
    <div className="loader-screen">
      <div className="loader-card">
        <div className="spinner"></div>
        <p>{text}</p>
      </div>
    </div>
  );
}
