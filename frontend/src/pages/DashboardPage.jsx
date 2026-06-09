import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import { getDashboardOverviewApi } from "../api/dashboardApi";
import DashboardCard from "../components/common/DashboardCard";
import LoadingMessage from "../components/common/LoadingMessage";
import ErrorMessage from "../components/common/ErrorMessage";

import styles from "./DashboardPage.module.css";

function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardOverview = async () => {
    try {
      setError("");

      const res = await getDashboardOverviewApi();
      setOverview(res.data.data || res.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải dữ liệu dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  return (
    <MainLayout>
      <h1 className={styles.title}>Dashboard</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && overview && (
        <div className={styles.cardGrid}>
          <DashboardCard title="Tổng phiên học" value={overview.total_sessions} />

          <DashboardCard title="Tổng câu hỏi" value={overview.total_questions} />

          <DashboardCard title="Câu đúng" value={overview.correct_answers} />

          <DashboardCard title="Tỉ lệ đúng" value={`${overview.accuracy_rate}%`} />

          <DashboardCard title="Yêu thích" value={overview.favorite_count} />

          <DashboardCard title="Từ cần ôn" value={overview.due_vocabulary_count} />
        </div>
      )}
    </MainLayout>
  );
}

export default DashboardPage;