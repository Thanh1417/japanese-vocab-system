import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import { getQuestionResultsBySessionApi, getStudySessionDetailApi } from "../../../api/studySessionApi";
import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";
import styles from "./StudySessionDetailPage.module.css";

function StudySessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [sessionRes, resultRes] = await Promise.all([
          getStudySessionDetailApi(sessionId),
          getQuestionResultsBySessionApi(sessionId)
        ]);
        setSession(sessionRes.data.data || sessionRes.data);
        setResults(resultRes.data.data || resultRes.data);
      } catch (error) {
        setError("Không thể tải chi tiết phiên học");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [sessionId]);

  const getSessionTypeName = (type) => {
    if (type === 'flashcard') return 'Thẻ ghi nhớ';
    if (type === 'multiple_choice') return 'Trắc nghiệm';
    if (type === 'typing') return 'Tự luận';
    return type;
  };

  // Hàm tạo nhãn màu sắc cho Rating
  const renderSrsBadge = (rating) => {
    if (!rating) return <span className={styles.srsBadge}>-</span>;
    switch(rating.toLowerCase()) {
      case 'again': return <span className={`${styles.srsBadge} ${styles.srsAgain}`}>Quên</span>;
      case 'hard': return <span className={`${styles.srsBadge} ${styles.srsHard}`}>Khó</span>;
      case 'good': return <span className={`${styles.srsBadge} ${styles.srsGood}`}>Được</span>;
      case 'easy': return <span className={`${styles.srsBadge} ${styles.srsEasy}`}>Dễ</span>;
      default: return <span className={styles.srsBadge}>-</span>;
    }
  };

  return (
    <MainLayout>
      <div className={styles.headerArea}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>⬅ Quay lại</button>
        <h1 className={styles.title}>Chi tiết phiên học</h1>
      </div>

      <ErrorMessage message={error} />
      {loading && <LoadingMessage />}

      {!loading && session && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span>Hình thức</span>
              <strong className={styles.typeText}>{getSessionTypeName(session.session_type)}</strong>
            </div>
            <div className={styles.statBox}>
              <span>Tổng tương tác</span>
              <strong>{session.total_questions || 0}</strong>
            </div>
            {session.session_type !== 'flashcard' && (
              <>
                <div className={styles.statBox}>
                  <span>Số câu đúng</span>
                  <strong className={styles.correct}>{session.correct_answers}</strong>
                </div>
                <div className={styles.statBox}>
                  <span>Tỉ lệ chính xác</span>
                  <strong>{session.total_questions > 0 ? Math.round((session.correct_answers / session.total_questions) * 100) : 0}%</strong>
                </div>
              </>
            )}
          </div>

          <div className={styles.tableWrapper}>
            {session.session_type === 'flashcard' ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th width="80px" style={{ textAlign: "center" }}>STT</th>
                    <th>Từ vựng</th>
                    <th style={{ textAlign: "center" }}>Đánh giá (SRS)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length > 0 ? results.map((r, index) => {
                    // Lấy từ vựng từ quan hệ vocabulary (nếu có) hoặc từ question.vocabulary
                    const word = r.vocabulary?.word || r.question?.vocabulary?.word || "Đang tải...";
                    return (
                      <tr key={r.result_id}>
                        <td className={styles.indexCol} style={{ textAlign: "center" }}>{index + 1}</td>
                        <td><strong>{word}</strong></td>
                        <td style={{ textAlign: "center" }}>{renderSrsBadge(r.rating)}</td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan="3" style={{ textAlign: "center", padding: "30px" }}>Chưa có dữ liệu từ vựng cho phiên này</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th width="60px" style={{ textAlign: "center" }}>STT</th>
                    <th>Nội dung câu hỏi</th>
                    <th>Từ vựng</th>
                    <th>Bạn đã chọn</th>
                    <th>Đáp án đúng</th>
                    <th style={{ textAlign: "center" }}>Kết quả</th>
                    <th style={{ textAlign: "center" }}>Đánh giá (SRS)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length > 0 ? results.map((r, index) => (
                    <tr key={r.result_id}>
                      <td className={styles.indexCol} style={{ textAlign: "center" }}>{index + 1}</td>
                      <td className={styles.questionCol}>{r.question?.content}</td>
                      <td><strong>{r.question?.vocabulary?.word}</strong></td>
                      <td>
                        <span className={r.is_correct ? styles.textCorrect : styles.textWrong}>
                          {r.user_answer}
                        </span>
                      </td>
                      <td className={styles.textCorrect}>{r.question?.correct_answer}</td>
                      <td style={{ textAlign: "center" }}>
                        {r.is_correct ?
                          <span className={styles.badgeCorrect}>Đúng</span> :
                          <span className={styles.badgeWrong}>Sai</span>
                        }
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {renderSrsBadge(r.rating)}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>Không có dữ liệu trả lời cho phiên này</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
}
export default StudySessionDetailPage;