import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

export function ProtectedRoute() {
  const { doctor, isCheckingAuth } = useAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return <div className="centered-page">Checking login...</div>;
  }

  if (!doctor) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
