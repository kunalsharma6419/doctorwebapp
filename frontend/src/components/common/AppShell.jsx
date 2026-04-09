import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

export function AppShell() {
  const { doctor, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          DoctorApp
        </Link>
        <nav className="nav-links">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/patients">Patients</NavLink>
          <NavLink to="/consultations">Consultations</NavLink>
          <NavLink to="/consultations/new">New Consultation</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
        <div className="sidebar-footer">
          <small>{doctor?.name}</small>
          <button type="button" className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
