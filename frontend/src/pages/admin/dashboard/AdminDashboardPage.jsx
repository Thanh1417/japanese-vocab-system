import { useEffect, useState } from "react";

import MainLayout from "../../../layouts/MainLayout";
import { getDashboardOverviewApi } from "../../../api/dashboardApi";
import DashboardCard from "../../../components/common/DashboardCard";
import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import styles from "./AdminDashboardPage.module.css";

function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
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
    fetchOverview();
  }, []);

  return (
    <MainLayout>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && overview && (
        <div className={styles.grid}>
          <DashboardCard title="Phiên học" value={overview.total_sessions} />

          <DashboardCard
            title="Tổng câu hỏi"
            value={overview.total_questions}
          />

          <DashboardCard
            title="Câu trả lời đúng"
            value={overview.correct_answers}
          />

          <DashboardCard
            title="Tỉ lệ đúng"
            value={`${overview.accuracy_rate}%`}
          />

          <DashboardCard
            title="Từ yêu thích"
            value={overview.favorite_count}
          />

          <DashboardCard
            title="Từ cần ôn"
            value={overview.due_vocabulary_count}
          />
        </div>
      )}
    </MainLayout>
  );
}

export default AdminDashboardPage;