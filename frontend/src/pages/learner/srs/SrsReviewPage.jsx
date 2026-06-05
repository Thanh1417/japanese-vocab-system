import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import {
  getDueSrsVocabulariesApi,
  submitSrsReviewApi,
} from "../../../api/srsApi";

function SrsReviewPage() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDueVocabularies = async () => {
    try {
      const res = await getDueSrsVocabulariesApi();
      setItems(res.data.data || res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể tải danh sách ôn tập");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (isCorrect) => {
    const currentItem = items[currentIndex];
    const vocab = currentItem.vocabulary || currentItem;

    try {
      await submitSrsReviewApi({
        vocabulary_id: vocab.vocabulary_id,
        is_correct: isCorrect,
      });

      setShowMeaning(false);
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể lưu kết quả ôn tập");
    }
  };

  useEffect(() => {
    fetchDueVocabularies();
  }, []);

  const currentItem = items[currentIndex];
  const currentVocab = currentItem?.vocabulary || currentItem;
  const isFinished = !loading && currentIndex >= items.length;

  return (
    <MainLayout>
      <h1>Ôn tập SRS</h1>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && items.length === 0 && (
        <p>Hôm nay bạn chưa có từ vựng nào cần ôn.</p>
      )}

      {isFinished && items.length > 0 && (
        <div>
          <h2>Hoàn thành ôn tập</h2>
          <p>Bạn đã ôn xong {items.length} từ vựng hôm nay.</p>
        </div>
      )}

      {!loading && currentVocab && !isFinished && (
        <div
          style={{
            background: "white",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            maxWidth: "600px",
          }}
        >
          <p>
            Từ {currentIndex + 1} / {items.length}
          </p>

          <h2 style={{ fontSize: "48px" }}>{currentVocab.word}</h2>

          <p>Cách đọc: {currentVocab.reading}</p>

          {!showMeaning && (
            <button onClick={() => setShowMeaning(true)}>Hiện nghĩa</button>
          )}

          {showMeaning && (
            <>
              <p>Nghĩa: {currentVocab.vietnamese_meaning}</p>
              <p>Ví dụ: {currentVocab.example_sentence}</p>

              <button onClick={() => handleSubmitReview(false)}>
                Sai
              </button>

              <button
                onClick={() => handleSubmitReview(true)}
                style={{ marginLeft: "10px" }}
              >
                Đúng
              </button>
            </>
          )}
        </div>
      )}
    </MainLayout>
  );
}

export default SrsReviewPage;