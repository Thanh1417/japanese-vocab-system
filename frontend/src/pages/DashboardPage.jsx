import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getDashboardOverviewApi } from "../api/dashboardApi";
import DashboardCard from "../components/common/DashboardCard";

function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardOverview = async () => {
    try {
      const res = await getDashboardOverviewApi();

      setOverview(res.data.data || res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  return (
    <MainLayout>
      <h1>Dashboard</h1>

      {loading && <p>Đang tải...</p>}

      {overview && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <DashboardCard
            title="Tổng phiên học"
            value={overview.total_sessions}
          />

          <DashboardCard
            title="Tổng câu hỏi"
            value={overview.total_questions}
          />

          <DashboardCard
            title="Câu đúng"
            value={overview.correct_answers}
          />

          <DashboardCard
            title="Tỉ lệ đúng"
            value={`${overview.accuracy_rate}%`}
          />

          <DashboardCard
            title="Yêu thích"
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

export default DashboardPage;