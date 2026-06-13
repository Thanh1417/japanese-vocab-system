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
  const [range, setRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await getDashboardOverviewApi(range);
      setStatistics(res.data.data || res.data);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [range]);

  const getHeatLevel = (count) => {
    if (count === 0) return styles.level0;
    if (count === 1) return styles.level1;
    if (count <= 3) return styles.level2;
    if (count <= 6) return styles.level3;
    return styles.level4;
  };

  const maxQuestions = Math.max(
    ...(statistics?.dailyStats || []).map((item) => item.questions),
    1
  );

  const maxLevelCount = Math.max(
    ...(statistics?.levelStats || []).map((item) => item.count),
    1
  );

  return (
    <MainLayout>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Thống kê học tập</h1>
          <p className={styles.subtitle}>
            Theo dõi tiến độ học từ vựng, quiz, SRS và mục tiêu học tập cá nhân.
          </p>
        </div>

        <select
          className={styles.rangeSelect}
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="7">7 ngày</option>
          <option value="30">30 ngày</option>
          <option value="90">3 tháng</option>
        </select>
      </div>

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
            <DashboardCard title="Chuỗi ngày học" value={`${statistics.studyStreak} ngày`} />
            <DashboardCard title="Tổng thời gian" value={`${statistics.totalStudyMinutes} phút`} />
          </div>

          <div className={styles.dashboardGrid}>
            <div className={styles.chartCard}>
              <h2>Tỷ lệ trả lời đúng</h2>

              <div className={styles.donutWrap}>
                <div
                  className={styles.donut}
                  style={{
                    background: `conic-gradient(#16a34a ${statistics.accuracy}%, #e5e7eb 0)`,
                  }}
                >
                  <span>{statistics.accuracy}%</span>
                </div>

                <div className={styles.legendList}>
                  <p>Đúng: {statistics.totalCorrect}</p>
                  <p>Sai: {statistics.totalWrong}</p>
                  <p>Tổng: {statistics.totalQuestions}</p>
                </div>
              </div>
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
                  <p className={styles.chartText}>Bạn chưa có mục tiêu học tập.</p>

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

          <div className={styles.chartCard}>
            <h2>Số câu luyện tập theo ngày</h2>

            <div className={styles.barChart}>
              {statistics.dailyStats.map((item) => (
                <div key={item.date} className={styles.barItem}>
                  <div className={styles.barColumn}>
                    <div
                      className={styles.correctBar}
                      style={{
                        height: `${(item.correct / maxQuestions) * 140}px`,
                      }}
                      title={`${item.date}: ${item.correct} câu đúng`}
                    />
                    <div
                      className={styles.wrongBar}
                      style={{
                        height: `${(item.wrong / maxQuestions) * 140}px`,
                      }}
                      title={`${item.date}: ${item.wrong} câu sai`}
                    />
                  </div>
                  <span>{item.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chartCard}>
            <h2>Số câu đã luyện theo cấp độ JLPT</h2>

            <div className={styles.levelBars}>
              {statistics.levelStats.map((item) => (
                <div key={item.level} className={styles.levelRow}>
                  <span>{item.level}</span>

                  <div className={styles.levelBarTrack}>
                    <div
                      className={styles.levelBarFill}
                      style={{
                        width: `${(item.count / maxLevelCount) * 100}%`,
                      }}
                    />
                  </div>

                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heatmapCard}>
            <div className={styles.heatmapHeader}>
              <h2>Hoạt động học tập</h2>
              <p>{statistics.range} ngày gần đây</p>
            </div>

            <div className={styles.heatmap}>
              {statistics.heatmap.map((item) => (
                <div
                  key={item.date}
                  className={`${styles.heatCell} ${getHeatLevel(item.count)}`}
                  title={`${item.date}: ${item.count} hoạt động`}
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