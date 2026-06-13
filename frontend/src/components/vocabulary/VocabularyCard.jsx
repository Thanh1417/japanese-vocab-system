import { useState } from "react";
import styles from "./VocabularyCard.module.css";

function VocabularyCard({ vocabulary, isFavorite, onToggleFavorite }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlayAudio = () => {
    if (!vocabulary.audio_url) {
      return;
    }

    const audio = new Audio(vocabulary.audio_url);
    audio.play();
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.word}>{vocabulary.word}</h2>

          <button
            className={`${styles.heartButton} ${
              isFavorite ? styles.heartActive : ""
            }`}
            onClick={() => onToggleFavorite(vocabulary.vocabulary_id)}
            title={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
          >
            ♥
          </button>
        </div>

        <p className={styles.info}>Đọc: {vocabulary.reading || "Chưa có"}</p>

        <p className={styles.info}>
          Nghĩa: {vocabulary.vietnamese_meaning}
        </p>

        <div className={styles.actions}>
          <button
            className={styles.detailButton}
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            Xem chi tiết
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalWord}>{vocabulary.word}</h2>
                <p className={styles.modalReading}>
                  {vocabulary.reading || "Chưa có cách đọc"}
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.badgeRow}>
              <span className={styles.levelBadge}>{vocabulary.jlpt_level}</span>

              {vocabulary.lesson?.lesson_name && (
                <span className={styles.lessonBadge}>
                  {vocabulary.lesson.lesson_name.replace(
                    "Minna no Nihongo - ",
                    ""
                  )}
                </span>
              )}
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span>Từ vựng</span>
                <strong>{vocabulary.word}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Cách đọc</span>
                <strong>{vocabulary.reading || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Âm Hán</span>
                <strong>{vocabulary.kanji_meaning || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Nghĩa tiếng Việt</span>
                <strong>{vocabulary.vietnamese_meaning}</strong>
              </div>
            </div>

            <div className={styles.exampleBox}>
              <span>Ví dụ minh hoạ</span>
              <p>
                {vocabulary.example_sentence ||
                  "Từ vựng này chưa có ví dụ minh hoạ."}
              </p>
            </div>

            <div className={styles.modalActions}>
              {vocabulary.audio_url && (
                <button
                  className={styles.audioButton}
                  onClick={handlePlayAudio}
                >
                  Nghe phát âm
                </button>
              )}

              <button
                className={`${styles.modalFavoriteButton} ${
                  isFavorite ? styles.modalFavoriteActive : ""
                }`}
                onClick={() => onToggleFavorite(vocabulary.vocabulary_id)}
              >
                {isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VocabularyCard;