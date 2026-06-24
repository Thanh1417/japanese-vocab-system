import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function AdminRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();

    // Nếu đang lấy dữ liệu thì không làm gì cả (hiển thị màn hình trắng hoặc xoay vòng)
    if (loading) {
        return <div style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>Đang tải dữ liệu...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default AdminRoute;