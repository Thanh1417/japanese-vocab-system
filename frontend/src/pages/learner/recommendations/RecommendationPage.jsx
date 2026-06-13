import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../../layouts/MainLayout";
import { getRecommendationsApi } from "../../../api/recommendationApi";
import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import styles from "./RecommendationPage.module.css";

function RecommendationPage() {
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    try {
      setError("");

      const res = await getRecommendationsApi();

      setRecommendations(res.data.data || res.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải gợi ý học tập"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getPriorityLabel = (priority) => {
    if (priority === "high") return "Cao";
    if (priority === "medium") return "Trung bình";
    return "Thấp";
  };

  const handleGoFlashcard = () => {
  navigate("/flashcards?source=recommendation");
};

const handleGoMultipleChoice = () => {
  navigate("/quiz?source=recommendation&mode=multiple_choice");
};

const handleGoTyping = () => {
  navigate("/quiz?source=recommendation&mode=typing");
};

  return (
    <MainLayout>
      <h1 className={styles.title}>Gợi ý nội dung học</h1>

      <p className={styles.description}>
        Hệ thống phân tích tiến độ SRS, kết quả quiz và mục tiêu học tập hiện
        tại để đề xuất danh sách từ vựng nên học hoặc ôn tập.
      </p>

      <div className={styles.studyActions}>
        <button onClick={handleGoFlashcard}>Học Flashcard</button>
        <button onClick={handleGoMultipleChoice}>Trắc nghiệm</button>
        <button onClick={handleGoTyping}>Tự luận</button>
      </div>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && recommendations.length === 0 && (
        <p className={styles.message}>
          Chưa có gợi ý học tập. Hãy tạo mục tiêu học tập, làm quiz hoặc ôn tập
          SRS để hệ thống có dữ liệu.
        </p>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <>
          <p className={styles.resultText}>
            Có <strong>{recommendations.length}</strong> từ vựng được gợi ý
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Từ vựng</th>
                  <th>Cách đọc</th>
                  <th>Âm Hán</th>
                  <th>Nghĩa</th>
                  <th>Loại gợi ý</th>
                  <th>Ưu tiên</th>
                  <th>Lý do</th>
                </tr>
              </thead>

              <tbody>
                {recommendations.map((item) => (
                  <tr key={item.vocabulary_id}>
                    <td>{item.word}</td>
                    <td>{item.reading || "-"}</td>
                    <td>{item.kanji_meaning || "-"}</td>
                    <td>{item.vietnamese_meaning}</td>
                    <td>{item.typeLabel}</td>
                    <td>
                      <span className={`${styles.priority} ${styles[item.priority]}`}>
                        {getPriorityLabel(item.priority)}
                      </span>
                    </td>
                    <td>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default RecommendationPage;