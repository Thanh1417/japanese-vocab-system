import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import { getDashboardOverviewApi } from "../api/dashboardApi";

import DashboardCard from "../components/common/DashboardCard";
import LoadingMessage from "../components/common/LoadingMessage";
import ErrorMessage from "../components/common/ErrorMessage";

import styles from "./DashboardPage.module.css";

function DashboardPage() {
  const navigate = useNavigate();

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

  const getHeatLevel = (count) => {
    if (count === 0) return styles.level0;
    if (count === 1) return styles.level1;
    if (count === 2) return styles.level2;
    if (count <= 4) return styles.level3;
    return styles.level4;
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Dashboard học tập</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && statistics && (
        <>
          <div className={styles.cardGrid}>
            <DashboardCard title="Phiên học" value={statistics.totalSessions} />
            <DashboardCard title="Tổng câu hỏi" value={statistics.totalQuestions} />
            <DashboardCard title="Câu đúng" value={statistics.totalCorrect} />
            <DashboardCard title="Tỉ lệ đúng" value={`${statistics.accuracy}%`} />
            <DashboardCard title="Từ yêu thích" value={statistics.totalFavorites} />
            <DashboardCard title="Từ đã học" value={statistics.learnedWords} />
            <DashboardCard title="Cần ôn SRS" value={statistics.dueWords} />
          </div>

          <div className={styles.dashboardGrid}>
            <div className={styles.chartCard}>
              <h2>Độ chính xác Quiz</h2>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${statistics.accuracy}%` }}
                />
              </div>

              <p className={styles.chartText}>
                Bạn trả lời đúng {statistics.totalCorrect} /{" "}
                {statistics.totalQuestions} câu, đạt {statistics.accuracy}%.
              </p>
            </div>

            <div className={styles.chartCard}>
              <h2>Mục tiêu hiện tại</h2>

              {statistics.activeGoal ? (
                <>
                  <p className={styles.goalName}>
                    {statistics.activeGoal.goal_name} -{" "}
                    {statistics.activeGoal.jlpt_level}
                  </p>

                  <div className={styles.progressBar}>
                    <div
                      className={styles.goalFill}
                      style={{ width: `${statistics.goalProgress}%` }}
                    />
                  </div>

                  <p className={styles.chartText}>
                    Đã học {statistics.goalLearnedWords} /{" "}
                    {statistics.activeGoal.total_words} từ, đạt{" "}
                    {statistics.goalProgress}%.
                  </p>

                  <button
                    className={styles.actionButton}
                    onClick={() => navigate("/study-goals")}
                  >
                    Xem kế hoạch
                  </button>
                </>
              ) : (
                <>
                  <p className={styles.chartText}>
                    Bạn chưa có mục tiêu học tập.
                  </p>

                  <button
                    className={styles.actionButton}
                    onClick={() => navigate("/study-goals")}
                  >
                    Tạo mục tiêu
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={styles.heatmapCard}>
            <div className={styles.heatmapHeader}>
              <h2>Hoạt động học tập 90 ngày gần đây</h2>
              <p>{statistics.totalSessions} phiên học</p>
            </div>

            <div className={styles.heatmap}>
              {statistics.activityHeatmap.map((item) => (
                <div
                  key={item.date}
                  className={`${styles.heatCell} ${getHeatLevel(item.count)}`}
                  title={`${item.date}: ${item.count} phiên học`}
                />
              ))}
            </div>

            <div className={styles.legend}>
              <span>Ít</span>
              <div className={`${styles.heatCell} ${styles.level0}`} />
              <div className={`${styles.heatCell} ${styles.level1}`} />
              <div className={`${styles.heatCell} ${styles.level2}`} />
              <div className={`${styles.heatCell} ${styles.level3}`} />
              <div className={`${styles.heatCell} ${styles.level4}`} />
              <span>Nhiều</span>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default DashboardPage;