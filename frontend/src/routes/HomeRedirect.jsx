import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function HomeRedirect() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default HomeRedirect;