import { addFavoriteVocabularyApi } from "../../api/favoriteApi";
import styles from "./VocabularyCard.module.css";

function VocabularyCard({ vocabulary }) {
  const handleAddFavorite = async () => {
    try {
      await addFavoriteVocabularyApi(vocabulary.vocabulary_id);
      alert("Đã thêm vào yêu thích");
    } catch (error) {
      alert(error.response?.data?.message || "Thêm yêu thích thất bại");
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.word}>{vocabulary.word}</h2>

      <p className={styles.info}>Đọc: {vocabulary.reading}</p>
      <p className={styles.info}>Nghĩa: {vocabulary.vietnamese_meaning}</p>
      <p className={styles.info}>JLPT: {vocabulary.jlpt_level}</p>

      <button className={styles.favoriteButton} onClick={handleAddFavorite}>
        Thêm yêu thích
      </button>
    </div>
  );
}

export default VocabularyCard;