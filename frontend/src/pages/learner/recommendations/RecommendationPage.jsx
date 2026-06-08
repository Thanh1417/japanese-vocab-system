import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { getRecommendationsApi } from "../../../api/recommendationApi";
import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";
import styles from "./RecommendationPage.module.css";

function RecommendationPage() {
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

  return (
    <MainLayout>
      <h1 className={styles.title}>Gợi ý nội dung học</h1>

      <p className={styles.description}>
        Hệ thống gợi ý các từ vựng nên học hoặc ôn tập dựa trên lịch sử học,
        kết quả quiz và tiến độ SRS.
      </p>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && recommendations.length === 0 && (
        <p className={styles.message}>
          Chưa có gợi ý học tập. Hãy làm quiz hoặc ôn tập thêm để hệ thống có dữ liệu.
        </p>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <div className={styles.grid}>
          {recommendations.map((item) => {
            const vocab = item.vocabulary || item;

            return (
              <div key={vocab.vocabulary_id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.word}>{vocab.word}</h2>
                  <span className={styles.level}>{vocab.jlpt_level}</span>
                </div>

                <p>
                  <strong>Cách đọc:</strong> {vocab.reading || "Chưa có"}
                </p>

                <p>
                  <strong>Nghĩa:</strong> {vocab.vietnamese_meaning}
                </p>

                {vocab.example_sentence && (
                  <p className={styles.example}>{vocab.example_sentence}</p>
                )}

                <div className={styles.reason}>
                  <strong>Lý do gợi ý:</strong>{" "}
                  {item.reason || "Phù hợp với tiến độ học hiện tại của bạn."}
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