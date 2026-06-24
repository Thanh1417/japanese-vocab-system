import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import { getMyStudySessionsApi } from "../../../api/studySessionApi";
import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";
import styles from "./StudySessionListPage.module.css";

function StudySessionListPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getMyStudySessionsApi();
        setSessions(res?.data?.data || res?.data || []);
      } catch (error) {
        setError("Không thể tải lịch sử phiên học");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const sortedSessions = [...sessions].sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage) || 1;
  const paginatedSessions = sortedSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderTypeBadge = (type) => {
    switch (type) {
      case "flashcard": return <span className={`${styles.typeBadge} ${styles.typeFlashcard}`}>Flashcard</span>;
      case "multiple_choice": return <span className={`${styles.typeBadge} ${styles.typeChoice}`}>Trắc nghiệm</span>;
      case "typing": return <span className={`${styles.typeBadge} ${styles.typeTyping}`}>Tự luận</span>;
      default: return <span className={styles.typeBadge}>Quiz</span>;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return `${d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString("vi-VN")}`;
  };

  return (
    <MainLayout>
      <div className={styles.headerArea}>
        <h1 className={styles.title}>Lịch sử học tập</h1>
      </div>

      <ErrorMessage message={error} />
      {loading && <LoadingMessage />}
      
      {!loading && sortedSessions.length === 0 && (
        <div className={styles.emptyState}>
           <p>Bạn chưa có phiên học nào. Hãy bắt đầu ôn tập từ vựng ngay nhé!</p>
           <Link to="/quiz" className={styles.primaryBtn}>Học ngay</Link>
        </div>
      )}

      {!loading && sortedSessions.length > 0 && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th width="60px" style={{textAlign: "center"}}>STT</th>
                  <th width="160px">Hình thức</th>
                  <th>Thời gian</th>
                  <th>Kết quả</th>
                  <th width="120px" style={{textAlign: "center"}}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSessions.map((s, index) => {
                  const stt = (currentPage - 1) * itemsPerPage + index + 1;
                  
                  return (
                    <tr key={s.session_id}>
                      <td className={styles.indexCol}>{stt}</td>
                      <td>{renderTypeBadge(s.session_type)}</td>
                      <td>
                        <div className={styles.timeBlock}>
                          <span className={styles.timeLabel}>Bắt đầu:</span> {formatDateTime(s.start_time)}
                        </div>
                        <div className={styles.timeBlock}>
                          <span className={styles.timeLabel}>Kết thúc:</span> 
                          {s.end_time ? formatDateTime(s.end_time) : <span className={styles.studyingText}>Đang học...</span>}
                        </div>
                      </td>
                      <td>
                        {s.session_type === 'flashcard' ? (
                          <span className={styles.scoreNeutral}>Đã lật {s.total_questions || 0} thẻ</span>
                        ) : (
                          <span>
                            <strong className={styles.scoreCorrect}>{s.correct_answers}</strong> 
                            <span className={styles.scoreTotal}> / {s.total_questions} đúng</span>
                          </span>
                        )}
                      </td>
                      <td style={{textAlign: "center"}}>
                        <Link className={styles.detailLink} to={`/study-sessions/${s.session_id}`}>Xem</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Trước</button>
              <span>Trang {currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Sau</button>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
}
export default StudySessionListPage;