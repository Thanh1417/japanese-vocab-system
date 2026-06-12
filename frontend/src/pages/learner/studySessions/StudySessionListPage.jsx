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

  const fetchSessions = async () => {
    try {
      setError("");

      const res = await getMyStudySessionsApi();

      setSessions(res.data.data || res.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải lịch sử phiên học"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.start_time) - new Date(a.start_time);
  });

  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);

  const paginatedSessions = sortedSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Lịch sử học tập</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && sortedSessions.length === 0 && (
        <p className={styles.message}>Bạn chưa có phiên học nào.</p>
      )}

      {!loading && !error && sortedSessions.length > 0 && (
        <>
          <p className={styles.resultText}>
            Tổng số phiên học: <strong>{sortedSessions.length}</strong>
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Loại phiên</th>
                  <th>Bắt đầu</th>
                  <th>Kết thúc</th>
                  <th>Số câu</th>
                  <th>Câu đúng</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>

              <tbody>
                {paginatedSessions.map((session) => (
                  <tr key={session.session_id}>
                    <td>{session.session_id}</td>

                    <td>
                      <span className={styles.badge}>
                        {session.session_type}
                      </span>
                    </td>

                    <td>{new Date(session.start_time).toLocaleString()}</td>

                    <td>
                      {session.end_time
                        ? new Date(session.end_time).toLocaleString()
                        : "Chưa kết thúc"}
                    </td>

                    <td>{session.total_questions}</td>
                    <td>{session.correct_answers}</td>

                    <td>
                      <Link
                        className={styles.detailLink}
                        to={`/study-sessions/${session.session_id}`}
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Trước
            </button>

            <span>
              Trang {currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Sau
            </button>
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default StudySessionListPage;