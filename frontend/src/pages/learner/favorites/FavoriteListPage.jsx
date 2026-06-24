import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import {
  getMyFavoritesApi,
  removeFavoriteVocabularyApi,
} from "../../../api/favoriteApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import styles from "./FavoriteListPage.module.css";

function FavoriteListPage() {
  const [favorites, setFavorites] = useState([]);
  const [selectedVocabulary, setSelectedVocabulary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchFavorites = async () => {
    try {
      setError("");
      const res = await getMyFavoritesApi();
      setFavorites(res.data.data || res.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Không thể tải danh sách từ vựng yêu thích"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const normalizedFavorites = favorites.map((item) => {
    return item.vocabulary || item;
  });

  const jlptOrder = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };

  const sortedFavorites = [...normalizedFavorites].sort((a, b) => {
    const levelCompare = jlptOrder[a.jlpt_level] - jlptOrder[b.jlpt_level];
    if (levelCompare !== 0) {
      return levelCompare;
    }
    return a.vocabulary_id - b.vocabulary_id;
  });

  const totalPages = Math.ceil(sortedFavorites.length / itemsPerPage) || 1;

  const paginatedFavorites = sortedFavorites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleRemoveFavorite = async (vocabularyId) => {
    try {
      setError("");
      await removeFavoriteVocabularyApi(vocabularyId);

      setFavorites((prev) =>
        prev.filter((item) => {
          const vocab = item.vocabulary || item;
          return vocab.vocabulary_id !== vocabularyId;
        })
      );

      if (selectedVocabulary?.vocabulary_id === vocabularyId) {
        setSelectedVocabulary(null);
      }

      if (paginatedFavorites.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Xoá yêu thích thất bại");
    }
  };

  // Đồng bộ tính năng phát âm Text-to-Speech như trang Danh sách từ vựng
  const handlePlayAudio = (text) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';

      const voices = window.speechSynthesis.getVoices();
      const japaneseVoices = voices.filter(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
      if (japaneseVoices.length > 0) {
        const femaleVoice = japaneseVoices.find(v =>
          v?.name?.includes('Google') || v?.name?.includes('Kyoko') || v?.name?.includes('Haruka') || v?.name?.includes('Nanami')
        );
        utterance.voice = femaleVoice || japaneseVoices[0];
      }
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt không hỗ trợ phát âm");
    }
  };

  const formatLessonName = (lessonName) => {
    if (!lessonName) return "";
    return lessonName.replace("Minna no Nihongo - ", "");
  };

  return (
    <MainLayout>
      <div className={styles.headerArea}>
        <h1 className={styles.title}>Từ vựng yêu thích</h1>
        <p className={styles.subtitle}>
          Danh sách các từ vựng bạn đã lưu để ôn tập lại nhanh hơn.
        </p>
      </div>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && sortedFavorites.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⭐</div>
          <h3>Chưa có từ vựng yêu thích</h3>
          <p>Bạn chưa lưu từ vựng nào. Hãy khám phá danh sách từ vựng và đánh dấu sao những từ bạn muốn ôn tập nhé!</p>
        </div>
      )}

      {!loading && !error && sortedFavorites.length > 0 && (
        <>
          <div className={styles.resultInfo}>
            Bạn đang lưu <span className={styles.highlight}>{sortedFavorites.length}</span> từ yêu thích
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Từ vựng</th>
                  <th>Cách đọc</th>
                  <th>Âm Hán</th>
                  <th>Nghĩa tiếng Việt</th>
                  <th>Cấp độ</th>
                  <th style={{ textAlign: "right", paddingRight: "24px" }}>Hành động</th>
                </tr>
              </thead>

              <tbody>
                {paginatedFavorites.map((vocab) => (
                  <tr key={vocab.vocabulary_id} className={styles.tableRow}>
                    <td className={styles.vocabWord}>{vocab.word}</td>
                    <td className={styles.vocabReading}>{vocab.reading || "-"}</td>
                    <td className={styles.vocabKanji}>{vocab.kanji_meaning || "-"}</td>
                    <td className={styles.vocabMeaning}>{vocab.vietnamese_meaning}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[vocab.jlpt_level] || ""}`}>
                        {vocab.jlpt_level}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.audioBtnTable}
                          onClick={() => handlePlayAudio(vocab.reading || vocab.word)}
                          title="Nghe phát âm"
                        >
                          ▶
                        </button>

                        <button
                          className={`${styles.starBtnTable} ${styles.starActive}`}
                          onClick={() => handleRemoveFavorite(vocab.vocabulary_id)}
                          title="Bỏ yêu thích"
                        >
                          ★
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.paginationWrapper}>
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                &larr; Trước
              </button>
              <div className={styles.pageIndicator}>
                Trang <strong>{currentPage}</strong> / {totalPages || 1}
              </div>
              <button
                className={styles.pageBtn}
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Sau &rarr;
              </button>
            </div>
          </div>
        </>
      )}

      {selectedVocabulary && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedVocabulary(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalWord}>
                  {selectedVocabulary.word}
                </h2>

                <p className={styles.modalReading}>
                  {selectedVocabulary.reading || "Chưa có cách đọc"}
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setSelectedVocabulary(null)}
              >
                ×
              </button>
            </div>

            <div className={styles.badgeRow}>
              <span className={`${styles.badge} ${styles[selectedVocabulary.jlpt_level] || ""}`}>
                {selectedVocabulary.jlpt_level}
              </span>

              {selectedVocabulary.lesson?.lesson_name && (
                <span className={styles.lessonBadge}>
                  {formatLessonName(selectedVocabulary.lesson.lesson_name)}
                </span>
              )}
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span>Từ vựng</span>
                <strong>{selectedVocabulary.word}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Cách đọc</span>
                <strong>{selectedVocabulary.reading || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Âm Hán</span>
                <strong>{selectedVocabulary.kanji_meaning || "-"}</strong>
              </div>

              <div className={styles.detailItem}>
                <span>Nghĩa tiếng Việt</span>
                <strong>{selectedVocabulary.vietnamese_meaning}</strong>
              </div>
            </div>

            <div className={styles.exampleBox}>
              <span>Ví dụ minh hoạ</span>
              <p>
                {selectedVocabulary.example_sentence ||
                  "Từ vựng này chưa có ví dụ minh hoạ."}
              </p>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.audioButton}
                onClick={() => handlePlayAudio(selectedVocabulary.reading || selectedVocabulary.word)}
              >
                🔊 Nghe phát âm
              </button>

              <button
                className={styles.removeButton}
                onClick={() =>
                  handleRemoveFavorite(selectedVocabulary.vocabulary_id)
                }
              >
                ★ Bỏ yêu thích
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default FavoriteListPage;