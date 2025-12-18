export default function Navbar({ user, logout }) {
  return (
    <div className="navbar">
      <span>{user.email} ({user.role})</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
