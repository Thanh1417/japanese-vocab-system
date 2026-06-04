import { Routes, Route, Navigate } from "react-router-dom";

import AdminRoute from "./AdminRoute";

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
                path="/admin/lessons"
                element={
                    <AdminRoute>
                        <LessonListPage />
                    </AdminRoute>
                }
            />

            {/* <Route
        path="/lessons"
        element={
            <ProtectedRoute>
            <LessonListPage />
            </ProtectedRoute>
        }
      /> */}
        </Routes>
    );
}

export default AppRoutes;