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

  return (
    <MainLayout>
      <h1 className={styles.title}>Lịch sử học tập</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && sessions.length === 0 && (
        <p className={styles.message}>Bạn chưa có phiên học nào.</p>
      )}

      {!loading && !error && sessions.length > 0 && (
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
              {sessions.map((session) => (
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
                    <Link to={`/study-sessions/${session.session_id}`}>
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}

export default StudySessionListPage;