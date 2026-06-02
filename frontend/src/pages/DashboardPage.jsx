import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getDashboardOverviewApi } from "../api/dashboardApi";

function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchDashboardOverview = async () => {
    try {
      const res = await getDashboardOverviewApi();
      setOverview(res.data.data || res.data);
    } catch (error) {
      setMessage(
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
      <h1>Dashboard</h1>

      {loading && <p>Đang tải dữ liệu...</p>}

      {message && <p>{message}</p>}

      {overview && (
        <div>
          <pre>{JSON.stringify(overview, null, 2)}</pre>
        </div>
      )}
    </MainLayout>
  );
}

export default DashboardPage;