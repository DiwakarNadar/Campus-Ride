import "../styles/Navbar.css";

export default function Navbar({ user, logout }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="nav-logo">CampusRide</span>
      </div>

      <div className="navbar-right">
        <span className="nav-user">{user.name}</span>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
