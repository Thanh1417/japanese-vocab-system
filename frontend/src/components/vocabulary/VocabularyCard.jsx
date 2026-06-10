import { useState } from "react";
import { Link } from "react-router-dom";

import { addFavoriteVocabularyApi } from "../../api/favoriteApi";

import styles from "./VocabularyCard.module.css";

function VocabularyCard({ vocabulary }) {
  const [message, setMessage] = useState("");

  const handleAddFavorite = async () => {
    try {
      setMessage("");

      await addFavoriteVocabularyApi(vocabulary.vocabulary_id);

      setMessage("Đã thêm vào yêu thích");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Thêm yêu thích thất bại"
      );
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.word}>
        {vocabulary.word}
      </h2>

      <p className={styles.info}>
        Đọc: {vocabulary.reading}
      </p>

      <p className={styles.info}>
        Nghĩa:{" "}
        {vocabulary.vietnamese_meaning}
      </p>

      <p className={styles.info}>
        JLPT: {vocabulary.jlpt_level}
      </p>

      {message && (
        <p className={styles.message}>
          {message}
        </p>
      )}

      <div className={styles.actions}>
        <button
          className={styles.favoriteButton}
          onClick={handleAddFavorite}
        >
          Thêm yêu thích
        </button>

        <Link
          className={styles.studyButton}
          to="/flashcards"
        >
          Học flashcard
        </Link>
      </div>
    </div>
  );
}

export default VocabularyCard;