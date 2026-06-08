import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import {
  getQuestionResultsBySessionApi,
  getStudySessionDetailApi,
} from "../../../api/studySessionApi";
import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";
import styles from "./StudySessionDetailPage.module.css";

function StudySessionDetailPage() {
  const { sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = async () => {
    try {
      setError("");

      const sessionRes = await getStudySessionDetailApi(sessionId);
      setSession(sessionRes.data.data || sessionRes.data);

      const resultRes = await getQuestionResultsBySessionApi(sessionId);
      setResults(resultRes.data.data || resultRes.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải chi tiết phiên học"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [sessionId]);

  return (
    <MainLayout>
      <h1 className={styles.title}>Chi tiết phiên học</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && session && (
        <div className={styles.summaryCard}>
          <p>ID phiên: {session.session_id}</p>
          <p>Loại phiên: {session.session_type}</p>
          <p>Số câu: {session.total_questions}</p>
          <p>Câu đúng: {session.correct_answers}</p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Câu hỏi</th>
                <th>Từ vựng</th>
                <th>Đáp án của bạn</th>
                <th>Đáp án đúng</th>
                <th>Kết quả</th>
              </tr>
            </thead>

            <tbody>
              {results.map((result) => (
                <tr key={result.result_id}>
                  <td>{result.question?.content}</td>
                  <td>{result.question?.vocabulary?.word}</td>
                  <td>{result.user_answer}</td>
                  <td>{result.question?.correct_answer}</td>
                  <td
                    className={
                      result.is_correct ? styles.correct : styles.wrong
                    }
                  >
                    {result.is_correct ? "Đúng" : "Sai"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <p className={styles.message}>Phiên học này chưa có kết quả câu hỏi.</p>
      )}
    </MainLayout>
  );
}

export default StudySessionDetailPage;