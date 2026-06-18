import { useEffect, useState } from "react";

import MainLayout from "../../../layouts/MainLayout";
import { getDashboardOverviewApi } from "../../../api/dashboardApi";

import DashboardCard from "../../../components/common/DashboardCard";
import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import styles from "./AdminDashboardPage.module.css";

// Bộ Icon SVG dành cho Admin
const Icons = {
  Sessions: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  Question: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>,
  Check: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Percent: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  Heart: <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
};

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

  const totalWrong = statistics ? statistics.totalQuestions - statistics.totalCorrect : 0;

  return (
    <MainLayout>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản trị hệ thống</h1>
          <p className={styles.subtitle}>
            Tổng quan dữ liệu và hiệu suất học tập của toàn bộ học viên trên hệ thống.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage text="Đang tải dữ liệu toàn hệ thống..." />}

      {!loading && !error && statistics && (
        <>
          {/* GRID CÁC THẺ THỐNG KÊ */}
          <div className={styles.cardGrid}>
            <DashboardCard 
              title="Tổng phiên học" 
              value={statistics.totalSessions} 
              icon={Icons.Sessions} 
              colorTheme="blue" 
              subtitle="Toàn hệ thống"
            />
            <DashboardCard 
              title="Lượt trả lời" 
              value={statistics.totalQuestions} 
              icon={Icons.Question} 
              colorTheme="purple" 
              subtitle="Câu hỏi đã làm"
            />
            <DashboardCard 
              title="Chính xác (Avg)" 
              value={`${statistics.accuracy}%`} 
              icon={Icons.Percent} 
              colorTheme="teal" 
              subtitle="Tỉ lệ trung bình"
            />
            <DashboardCard 
              title="Lượt yêu thích" 
              value={statistics.totalFavorites} 
              icon={Icons.Heart} 
              colorTheme="pink" 
              subtitle="Từ vựng được lưu"
            />
          </div>

          <div className={styles.dashboardGrid}>
            {/* BIỂU ĐỒ DONUT: TỶ LỆ TRẢ LỜI ĐÚNG TOÀN HỆ THỐNG */}
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
                    <p>Tổng câu Sai: <strong>{totalWrong}</strong></p>
                  </div>
                  <div className={styles.legendItem}>
                    <span className={styles.dot} style={{ background: '#6366f1' }}></span>
                    <p>Tổng tương tác: <strong>{statistics.totalQuestions}</strong></p>
                  </div>
                </div>
              </div>
            </div>

            {/* BẢNG TÓM TẮT & PROGRESS BAR */}
            <div className={styles.chartCard}>
              <h2>Tổng quan hiệu suất hệ thống</h2>
              
              <div className={styles.summaryWrapper}>
                <div className={styles.summaryItem}>
                  <div className={styles.summaryHeader}>
                    <span>Tỉ lệ chính xác trung bình</span>
                    <strong>{statistics.accuracy}%</strong>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${statistics.accuracy}%` }}
                    />
                  </div>
                </div>

                <div className={styles.infoBox}>
                  <div className={styles.infoIcon}>💡</div>
                  <div className={styles.infoText}>
                    Hệ thống ghi nhận tổng cộng <strong>{statistics.totalSessions}</strong> phiên học từ các học viên. 
                    Mức độ chính xác chung đạt <strong>{statistics.accuracy}%</strong>.
                    Đã có <strong>{statistics.totalFavorites}</strong> từ vựng được học viên lưu vào danh sách yêu thích.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </MainLayout>
  );
}

export default AdminDashboardPage;