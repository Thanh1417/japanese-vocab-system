import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function GuestRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null; 
  }

  if (isAuthenticated) {
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default GuestRoute;