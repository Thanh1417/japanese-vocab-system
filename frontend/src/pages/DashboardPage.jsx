import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import { getDashboardOverviewApi } from "../api/dashboardApi";

import DashboardCard from "../components/common/DashboardCard";
import LoadingMessage from "../components/common/LoadingMessage";
import ErrorMessage from "../components/common/ErrorMessage";

import styles from "./DashboardPage.module.css";

const Icons = {
  Book: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Question: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Percent: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>,
  Heart: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  Brain: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
  Alert: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Fire: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>,
  Clock: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

function DashboardPage() {
  const navigate = useNavigate();

  const [statistics, setStatistics] = useState(null);
  const [range, setRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const practiceChartRef = useRef(null);
  const timeChartRef = useRef(null);

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

  // Tự động cuộn 2 biểu đồ về bên phải (xem ngày mới nhất) khi có dữ liệu
  useEffect(() => {
    if (!loading && statistics) {
      if (practiceChartRef.current) {
        practiceChartRef.current.scrollLeft = practiceChartRef.current.scrollWidth;
      }
      if (timeChartRef.current) {
        timeChartRef.current.scrollLeft = timeChartRef.current.scrollWidth;
      }
    }
  }, [loading, statistics]);

  const getHeatLevel = (count) => {
    if (count === 0) return styles.level0;
    if (count === 1) return styles.level1;
    if (count <= 3) return styles.level2;
    if (count <= 6) return styles.level3;
    return styles.level4;
  };

  const maxQuestions = Math.max(...(statistics?.dailyStats || []).map((item) => item.questions), 1);
  const maxMinutes = Math.max(...(statistics?.dailyStats || []).map((item) => item.minutes), 1);
  const maxLevelCount = Math.max(...(statistics?.levelStats || []).map((item) => item.count), 1);

  const formatLabelDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr;
  };

  return (
    <MainLayout>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Thống kê học tập</h1>
          <p className={styles.subtitle}>
            Bức tranh toàn cảnh về nỗ lực và tiến độ học tiếng Nhật của bạn.
          </p>
        </div>

        <select
          className={styles.rangeSelect}
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="7">7 ngày qua</option>
          <option value="30">30 ngày qua</option>
          <option value="90">3 tháng qua</option>
        </select>
      </div>

      <ErrorMessage message={error} />
      {loading && <LoadingMessage text="Đang tổng hợp dữ liệu..." />}

      {!loading && !error && statistics && (
        <>
          <div className={styles.cardGrid}>
            <DashboardCard title="Phiên học" value={statistics.totalSessions} icon={Icons.Book} colorTheme="blue" />
            <DashboardCard title="Tổng câu hỏi" value={statistics.totalQuestions} icon={Icons.Question} colorTheme="purple" />
            <DashboardCard title="Câu đúng" value={statistics.totalCorrect} icon={Icons.Check} colorTheme="green" />
            <DashboardCard title="Tỉ lệ đúng" value={`${statistics.accuracy}%`} icon={Icons.Percent} colorTheme="teal" />
            <DashboardCard title="Từ yêu thích" value={statistics.totalFavorites} icon={Icons.Heart} colorTheme="pink" />
            <DashboardCard title="Từ đã học" value={statistics.learnedWords} icon={Icons.Brain} colorTheme="indigo" />
            <DashboardCard title="Cần ôn SRS" value={statistics.dueWords} icon={Icons.Alert} colorTheme="red" subtitle="Đến hạn ôn tập" />
            <DashboardCard title="Chuỗi ngày học" value={`${statistics.studyStreak} ngày`} icon={Icons.Fire} colorTheme="orange" subtitle="Giữ lửa nhé!" />
            <DashboardCard title="Tổng thời gian" value={`${statistics.totalStudyMinutes} phút`} icon={Icons.Clock} colorTheme="cyan" />
          </div>

          {/* HÀNG 1 & 2: GOM VÀO LƯỚI 2 CỘT (XẾP THEO HÀNG NGANG) */}
          <div className={styles.dashboardGrid}>

            {/* 1. TỶ LỆ TRẢ LỜI ĐÚNG */}
            <div className={styles.chartCard}>
              <h2>Tỷ lệ trả lời đúng</h2>
              <div className={styles.donutWrap}>
                <div
                  className={styles.donut}
                  style={{ background: `conic-gradient(#10b981 ${statistics.accuracy}%, #f1f5f9 0)` }}
                >
                  <div className={styles.donutInner}>
                    <span>{statistics.accuracy}%</span>
                  </div>
                </div>
                <div className={styles.legendList}>
                  <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: '#10b981' }}></span>
                    <p>Đúng: <strong>{statistics.totalCorrect}</strong></p>
                  </div>
                  <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: '#ef4444' }}></span>
                    <p>Sai: <strong>{statistics.totalWrong}</strong></p>
                  </div>
                  <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: '#6366f1' }}></span>
                    <p>Tổng: <strong>{statistics.totalQuestions}</strong></p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. DANH SÁCH MỤC TIÊU */}
            <div className={`${styles.chartCard} ${styles.goalsCard}`}>
              <h2>Lộ trình đang học</h2>
              {statistics.activeGoals && statistics.activeGoals.length > 0 ? (
                <div className={styles.goalList}>
                  {statistics.activeGoals.map((goal) => (
                    <div key={goal.goal_id} className={styles.goalItem}>
                      <div className={styles.goalHeader}>
                        <p className={styles.goalName}>{goal.goal_name}</p>
                        <span className={styles.goalBadge}>{goal.jlpt_level}</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div className={styles.goalFill} style={{ width: `${goal.goalProgress}%` }} />
                      </div>
                      <p className={styles.chartText}>
                        Đã học <strong>{goal.goalLearnedWords}</strong> / {goal.total_words} từ
                        <span className={styles.highlightText}> ({goal.goalProgress}%)</span>
                      </p>
                    </div>
                  ))}
                  <button className={styles.actionButton} onClick={() => navigate("/study-goals")}>
                    Quản lý lộ trình
                  </button>
                </div>
              ) : (
                <div className={styles.emptyGoal}>
                  <div className={styles.emptyIcon}>🎯</div>
                  <p className={styles.chartText}>Bạn chưa thiết lập lộ trình nào</p>
                  <button className={styles.actionButton} onClick={() => navigate("/study-goals")}>
                    Thiết lập ngay
                  </button>
                </div>
              )}
            </div>

            {/* 3. BIỂU ĐỒ SỐ CÂU LUYỆN TẬP (Vào lưới 2 cột) */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h2>Luyện tập ({statistics.range} ngày)</h2>
                <div className={styles.legendInline}>
                  <span className={styles.legendDot} style={{ background: '#10b981' }}>Đúng</span>
                  <span className={styles.legendDot} style={{ background: '#ef4444' }}>Sai</span>
                </div>
              </div>

              <div className={styles.barChartContainer} ref={practiceChartRef}>
                <div className={styles.barChartInner}>
                  {statistics.dailyStats.map((item) => (
                    <div key={item.date} className={styles.barItem}>
                      <div
                        className={styles.barColumnTrack}
                        title={`Ngày: ${formatLabelDate(item.date)}\nĐúng: ${item.correct} câu\nSai: ${item.wrong} câu\nThời gian học: ${item.minutes} phút`}
                      >
                        <div className={styles.barColumnFill}>
                          <div
                            className={styles.correctBar}
                            style={{ height: `${(item.correct / maxQuestions) * 100}%` }}
                          />
                          <div
                            className={styles.wrongBar}
                            style={{ height: `${(item.wrong / maxQuestions) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className={styles.dateLabel}>{formatLabelDate(item.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. PHÂN BỐ JLPT */}
            <div className={styles.chartCard}>
              <h2>Phân bố bài tập theo JLPT</h2>
              <div className={styles.levelBars}>
                {statistics.levelStats.map((item) => (
                  <div key={item.level} className={styles.levelRow}>
                    <span className={styles.levelLabel}>{item.level}</span>
                    <div className={styles.levelBarTrack}>
                      <div
                        className={styles.levelBarFill}
                        style={{ width: `${(item.count / maxLevelCount) * 100}%` }}
                      />
                    </div>
                    <strong className={styles.levelCount}>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            

          </div>

          {/* DÒNG CUỐI CÙNG: THỜI GIAN HỌC CHI TIẾT (FULL WIDTH) */}
          <div className={styles.fullWidthChartCard}>
            <div className={styles.chartHeader}>
              <h2>Thời gian học chi tiết ({statistics.range} ngày qua)</h2>
              <div className={styles.legendInline}>
                <span className={styles.legendDot} style={{ background: '#3b82f6' }}>Số phút</span>
              </div>
            </div>

            <div className={styles.barChartContainer} ref={timeChartRef}>
              <div className={styles.barChartInner}>
                {statistics.dailyStats.map((item) => (
                  <div key={`min-${item.date}`} className={styles.barItem}>
                    <div
                      className={styles.barColumnTrack}
                      title={`Ngày: ${formatLabelDate(item.date)}\nThời gian học: ${item.minutes} phút\nĐúng: ${item.correct} câu\nSai: ${item.wrong} câu`}
                    >
                      <div className={styles.barColumnFill}>
                        <div
                          className={styles.minuteBar}
                          style={{ height: `${(item.minutes / maxMinutes) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className={styles.dateLabel}>{formatLabelDate(item.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. TẦN SUẤT HOẠT ĐỘNG (HEATMAP) */}
            <div className={styles.heatmapCard}>
              <div className={styles.heatmapHeader}>
                <h2>Tần suất tương tác</h2>
              </div>
              <div className={styles.heatmap}>
                {statistics.heatmap.map((item) => (
                  <div
                    key={item.date}
                    className={`${styles.heatCell} ${getHeatLevel(item.count)}`}
                    title={`${item.date}: ${item.count} tương tác`}
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