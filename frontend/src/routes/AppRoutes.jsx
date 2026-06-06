import { Routes, Route, Navigate } from "react-router-dom";

import AdminRoute from "./AdminRoute";

import Login from "../pages/LoginPage";
import Dashboard from "../pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";

import LessonListPage from "../pages/admin/lessons/LessonListPage";
import VocabularyManagementPage from "../pages/admin/vocabularies/VocabularyManagementPage";
import QuestionManagementPage from "../pages/admin/questions/QuestionManagementPage";
import AccountManagementPage from "../pages/admin/accounts/AccountManagementPage";
import AdminDashboardPage from "../pages/admin/dashboard/AdminDashboardPage";


import VocabularyListPage from "../pages/learner/vocabularies/VocabularyListPage";
import FavoriteListPage from "../pages/learner/favorites/FavoriteListPage";
import SrsReviewPage from "../pages/learner/srs/SrsReviewPage";
import QuizPage from "../pages/learner/quiz/QuizPage";
import StudySessionListPage from "../pages/learner/studySessions/StudySessionListPage";
import StudySessionDetailPage from "../pages/learner/studySessions/StudySessionDetailPage";
import RecommendationPage from "../pages/learner/recommendations/RecommendationPage";

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
                path="/admin/dashboard"
                element={
                    <AdminRoute>
                        <AdminDashboardPage />
                    </AdminRoute>
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

            <Route
                path="/admin/vocabularies"
                element={
                    <AdminRoute>
                        <VocabularyManagementPage />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/questions"
                element={
                    <AdminRoute>
                        <QuestionManagementPage />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/accounts"
                element={
                    <AdminRoute>
                        <AccountManagementPage />
                    </AdminRoute>
                }
            />

            <Route
                path="/vocabularies"
                element={
                    <ProtectedRoute>
                        <VocabularyListPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/favorites"
                element={
                    <ProtectedRoute>
                        <FavoriteListPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/srs-review"
                element={
                    <ProtectedRoute>
                        <SrsReviewPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/quiz"
                element={
                    <ProtectedRoute>
                        <QuizPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/study-sessions"
                element={
                    <ProtectedRoute>
                        <StudySessionListPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/study-sessions/:sessionId"
                element={
                    <ProtectedRoute>
                        <StudySessionDetailPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/recommendations"
                element={
                    <ProtectedRoute>
                        <RecommendationPage />
                    </ProtectedRoute>
                }
            />


        </Routes>
    );
}

export default AppRoutes;