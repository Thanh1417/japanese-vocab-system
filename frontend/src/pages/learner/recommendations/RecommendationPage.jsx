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

  // Giữ nguyên luồng chuyển trang của bạn
  const handleGoFlashcard = () => {
    navigate("/quiz?source=recommendation&mode=flashcard");
  };

  const handleGoMultipleChoice = () => {
    navigate("/quiz?source=recommendation&mode=multiple_choice");
  };

  const handleGoTyping = () => {
    navigate("/quiz?source=recommendation&mode=typing");
  };

  return (
    <MainLayout>
      <div className={styles.headerArea}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>Gợi ý học tập thông minh</h1>
        </div>
        <p className={styles.description}>
          Hệ thống tự động phân tích tiến độ, kết quả và mục tiêu học tập để đề xuất danh sách từ vựng mà bạn cần ôn tập
        </p>
      </div>

      <ErrorMessage message={error} />
      {loading && <LoadingMessage text="Đang phân tích dữ liệu..." />}

      {/* TRẠNG THÁI TRỐNG KHI KHÔNG CÓ GỢI Ý */}
      {!loading && !error && recommendations.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🤖</div>
          <h3>Chưa có gợi ý học tập nào</h3>
          <p>
            Hãy thiết lập mục tiêu học tập, học từ vựng và luyện tập để hệ thống có dữ liệu phân tích và đưa ra lộ trình tốt nhất cho bạn nhé!
          </p>
        </div>
      )}

      {/* KHI CÓ GỢI Ý -> HIỂN THỊ NÚT HỌC VÀ BẢNG DỮ LIỆU */}
      {!loading && !error && recommendations.length > 0 && (
        <>
          <div className={styles.actionCard}>
            <h3 className={styles.actionCardTitle}>Bắt đầu ôn tập ngay với:</h3>
            <div className={styles.studyActions}>
              <button className={`${styles.actionBtn} ${styles.flashcardBtn}`} onClick={handleGoFlashcard}>
                Học Flashcard
              </button>
              <button className={`${styles.actionBtn} ${styles.quizBtn}`} onClick={handleGoMultipleChoice}>
                Trắc nghiệm
              </button>
              <button className={`${styles.actionBtn} ${styles.typingBtn}`} onClick={handleGoTyping}>
                Tự luận
              </button>
            </div>
          </div>

          <div className={styles.resultInfo}>
            Có <span className={styles.highlight}>{recommendations.length}</span> từ vựng cần được ôn tập
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Từ vựng</th>
                  <th>Cách đọc</th>
                  <th>Âm hán</th>
                  <th>Nghĩa</th>
                  <th>Loại gợi ý</th>
                  <th style={{ textAlign: 'center' }}>Ưu tiên</th>
                  <th>Lý do đề xuất</th>
                </tr>
              </thead>

              <tbody>
                {recommendations.map((item) => (
                  <tr key={item.vocabulary_id} className={styles.tableRow}>
                    <td className={styles.vocabWord}>{item.word}</td>
                    <td className={styles.vocabReading}>{item.reading || "-"}</td>
                    <td className={styles.vocabKanji}>{item.kanji_meaning || "-"}</td>
                    <td className={styles.vocabMeaning}>{item.vietnamese_meaning}</td>
                    <td>
                      <span className={styles.typeBadge}>
                        {item.typeLabel || "Ôn tập"}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`${styles.priority} ${styles[item.priority]}`}>
                        {getPriorityLabel(item.priority)}
                      </span>
                    </td>
                    <td className={styles.reasonText}>{item.reason}</td>
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