import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { getAdminDashboardOverviewApi } from "../../../api/dashboardApi"; 

import DashboardCard from "../../../components/common/DashboardCard";
import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import { 
  IconUsers, 
  IconDatabase, 
  IconSessions, 
  IconQuestion, 
  IconPercent, 
  IconGoal, 
  IconHeart 
} from "../../../components/icons/AdminIcons";

import styles from "./AdminDashboardPage.module.css";

function AdminDashboardPage() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30"); 

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAdminDashboardOverviewApi(timeRange);
      setStatistics(res.data.data || res.data);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [timeRange]);

  return (
    <MainLayout>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản trị hệ thống</h1>
          <p className={styles.subtitle}>
            Tổng quan dữ liệu và hiệu suất học tập của toàn bộ hệ thống.
          </p>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Lọc dữ liệu:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className={styles.timeSelect}>
            <option value="7">7 ngày qua</option>
            <option value="30">30 ngày qua</option>
            <option value="90">3 tháng qua</option>
            <option value="365">1 năm qua</option>
            <option value="9999">Tất cả thời gian</option>
          </select>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage text="Đang tải dữ liệu toàn hệ thống..." />}

      {!loading && !error && statistics && (
        <>
          <h2 className={styles.sectionTitle}>Tài nguyên hệ thống</h2>
          <div className={styles.cardGrid}>
            <DashboardCard 
              title="Tổng người dùng" 
              value={statistics.totalUsers} 
              icon={<IconUsers />} 
              colorTheme="blue" 
              subtitle="Tài khoản đăng ký"
            />
            <DashboardCard 
              title="Kho từ vựng" 
              value={statistics.totalVocabularies} 
              icon={<IconDatabase />} 
              colorTheme="teal" 
              subtitle="Từ vựng sẵn có"
            />
            <DashboardCard 
              title="Ngân hàng câu hỏi" 
              value={statistics.totalSystemQuestions} 
              icon={<IconQuestion />} 
              colorTheme="purple" 
              subtitle="Trắc nghiệm & Tự luận"
            />
            <DashboardCard 
              title="Hoàn thành mục tiêu" 
              value={`${statistics.goalCompletionRate}%`} 
              icon={<IconGoal />} 
              colorTheme="pink" 
              subtitle="Mục tiêu đã đạt"
            />
          </div>

          <h2 className={styles.sectionTitle}>
            Hoạt động trong {timeRange === '9999' ? 'Toàn bộ thời gian' : `${timeRange} ngày qua`}
          </h2>
          <div className={styles.cardGrid}>
            <DashboardCard 
              title="Tổng phiên học" 
              value={statistics.totalSessions} 
              icon={<IconSessions />} 
              colorTheme="blue" 
            />
            <DashboardCard 
              title="Lượt tương tác" 
              value={statistics.totalQuestions} 
              icon={<IconQuestion />} 
              colorTheme="teal" 
              subtitle="Câu hỏi đã làm"
            />
            <DashboardCard 
              title="Chính xác (Avg)" 
              value={`${statistics.accuracy}%`} 
              icon={<IconPercent />} 
              colorTheme="purple" 
            />
            <DashboardCard 
              title="Đã lưu yêu thích" 
              value={statistics.totalFavorites} 
              icon={<IconHeart />} 
              colorTheme="pink" 
            />
          </div>

          <div className={styles.dashboardGrid}>
            <div className={styles.chartCard}>
              <h2>Chất lượng học tập (Đúng / Sai)</h2>
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
                    <p>Tổng câu Đúng: <strong>{statistics.totalCorrect}</strong></p>
                  </div>
                  <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: '#ef4444' }}></span>
                    <p>Tổng câu Sai: <strong>{statistics.totalWrong}</strong></p>
                  </div>
                  <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: '#6366f1' }}></span>
                    <p>Tổng tương tác: <strong>{statistics.totalQuestions}</strong></p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h2>Nội dung được học nhiều nhất</h2>
              <p style={{color: "#64748b", fontSize: "14px", marginTop: 0, marginBottom: "20px"}}>
                Dựa trên tần suất trả lời câu hỏi theo từng cấp độ JLPT
              </p>
              
              <div className={styles.rankingList}>
                {statistics.topLevels && statistics.topLevels.length > 0 ? (
                  statistics.topLevels.map((item, index) => (
                    <div key={item.level} className={styles.rankingItem}>
                      <div className={styles.rankInfo}>
                        <span className={styles.rankNumber}>#{index + 1}</span>
                        <span className={`${styles.rankBadge} ${styles[item.level]}`}>{item.level}</span>
                      </div>
                      <div className={styles.rankCount}>
                        <strong>{item.count}</strong> lượt học
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{color: "#94a3b8", textAlign: "center", padding: "20px 0"}}>
                    Chưa có dữ liệu học tập trong thời gian này.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default AdminDashboardPage;