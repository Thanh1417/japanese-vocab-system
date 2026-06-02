import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/LoginPage";
import Dashboard from "../pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import LessonListPage from "../pages/lessons/LessonListPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lessons"
        element={
            <ProtectedRoute>
            <LessonListPage />
            </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;