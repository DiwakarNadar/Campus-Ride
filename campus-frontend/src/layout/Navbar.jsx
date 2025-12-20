import "./Navbar.css"
export default function Navbar({ user, logout }) {
  return (
    <div className="navbar">
      <span className="nav-title">{user.name}</span>
      <button className="nav-actions" onClick={logout}>Logout</button>
    </div>
  );
}
