import styles from "./VocabularyCard.module.css";

function VocabularyCard({ vocabulary, isFavorite, onToggleFavorite, onPlayAudio }) {
  if (!vocabulary) return null;

  return (
    <div className={styles.card}>
      {/* PHẦN ĐẦU: TỪ VỰNG & CÁC NÚT HÀNH ĐỘNG */}
      <div className={styles.cardHeader}>
        <div className={styles.wordArea}>
          <h2 className={styles.word}>{vocabulary.word}</h2>
          <span className={`${styles.levelBadge} ${styles[vocabulary.jlpt_level] || ""}`}>
            {vocabulary.jlpt_level}
          </span>
        </div>

        {/* GÓC PHẢI: NÚT NGHE & NGÔI SAO */}
        <div className={styles.actionArea}>
          <button
            className={styles.miniAudioBtn}
            onClick={(e) => {
              e.stopPropagation();
              onPlayAudio();
            }}
            title="Nghe phát âm"
          >
            ▶
          </button>

          <button
            className={`${styles.starButton} ${isFavorite ? styles.starActive : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(vocabulary.vocabulary_id);
            }}
            title={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </div>
      </div>

      {/* PHẦN THÂN: THÔNG TIN CHI TIẾT */}
      <div className={styles.cardBody}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Cách đọc:</span>
          <span className={styles.valueReading}>{vocabulary.reading || "-"}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Âm Hán:</span>
          <span className={styles.valueKanji}>{vocabulary.kanji_meaning || "-"}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Nghĩa:</span>
          <span className={styles.valueMeaning}>{vocabulary.vietnamese_meaning}</span>
        </div>
      </div>
    </div>
  );
}

export default VocabularyCard;