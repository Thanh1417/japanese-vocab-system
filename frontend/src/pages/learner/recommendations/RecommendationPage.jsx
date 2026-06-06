import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { getRecommendationsApi } from "../../../api/recommendationApi";
import styles from "./RecommendationPage.module.css";

function RecommendationPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      const res = await getRecommendationsApi();
      setRecommendations(res.data.data || res.data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể tải danh sách gợi ý học tập"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <MainLayout>
      <h1 className={styles.title}>Gợi ý nội dung học</h1>

      <p className={styles.description}>
        Hệ thống đề xuất các từ vựng nên học hoặc ôn tập dựa trên lịch sử học,
        kết quả làm quiz và tiến độ SRS của bạn.
      </p>

      {loading && <p className={styles.message}>Đang tải dữ liệu...</p>}

      {!loading && recommendations.length === 0 && (
        <p className={styles.message}>
          Hiện chưa có gợi ý học tập nào. Hãy làm quiz hoặc ôn tập thêm để hệ
          thống có dữ liệu phân tích.
        </p>
      )}

      {!loading && recommendations.length > 0 && (
        <div className={styles.grid}>
          {recommendations.map((item) => {
            const vocabulary = item.vocabulary || item;

            return (
              <div
                key={vocabulary.vocabulary_id}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <h2 className={styles.word}>{vocabulary.word}</h2>
                  <span className={styles.level}>{vocabulary.jlpt_level}</span>
                </div>

                <p className={styles.info}>
                  <strong>Cách đọc:</strong> {vocabulary.reading || "Chưa có"}
                </p>

                <p className={styles.info}>
                  <strong>Nghĩa:</strong> {vocabulary.vietnamese_meaning}
                </p>

                {vocabulary.example_sentence && (
                  <p className={styles.example}>
                    {vocabulary.example_sentence}
                  </p>
                )}

                <div className={styles.reasonBox}>
                  <strong>Lý do gợi ý:</strong>{" "}
                  {item.reason ||
                    "Từ này phù hợp với tiến độ học hiện tại của bạn."}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}

export default RecommendationPage;