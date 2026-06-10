import { useEffect, useState } from "react";

import MainLayout from "../../../layouts/MainLayout";
import { getDashboardOverviewApi } from "../../../api/dashboardApi";

import DashboardCard from "../../../components/common/DashboardCard";
import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import styles from "./AdminDashboardPage.module.css";

function AdminDashboardPage() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setError("");

      const res = await getDashboardOverviewApi();
      setStatistics(res.data.data || res.data);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <MainLayout>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && statistics && (
        <>
          <div className={styles.grid}>
            <DashboardCard title="Phiên học" value={statistics.totalSessions} />
            <DashboardCard title="Tổng câu hỏi" value={statistics.totalQuestions} />
            <DashboardCard title="Câu đúng" value={statistics.totalCorrect} />
            <DashboardCard title="Tỉ lệ đúng" value={`${statistics.accuracy}%`} />
            <DashboardCard title="Từ yêu thích" value={statistics.totalFavorites} />
          </div>

          <div className={styles.chartCard}>
            <h2>Tổng quan độ chính xác</h2>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${statistics.accuracy}%` }}
              />
            </div>

            <p className={styles.chartText}>
              Hệ thống ghi nhận {statistics.totalCorrect} /{" "}
              {statistics.totalQuestions} câu trả lời đúng, đạt{" "}
              {statistics.accuracy}%.
            </p>
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default AdminDashboardPage;