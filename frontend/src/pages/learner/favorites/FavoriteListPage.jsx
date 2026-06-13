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

  const jlptOrder = {
    N5: 1,
    N4: 2,
    N3: 3,
    N2: 4,
    N1: 5,
  };

  const sortedFavorites = [...normalizedFavorites].sort((a, b) => {
    const levelCompare = jlptOrder[a.jlpt_level] - jlptOrder[b.jlpt_level];

    if (levelCompare !== 0) {
      return levelCompare;
    }

    return a.vocabulary_id - b.vocabulary_id;
  });

  const totalPages = Math.ceil(sortedFavorites.length / itemsPerPage);

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

  const handlePlayAudio = (vocab) => {
    if (!vocab.audio_url) {
      return;
    }

    const audio = new Audio(vocab.audio_url);
    audio.play();
  };

  const formatLessonName = (lessonName) => {
    if (!lessonName) {
      return "";
    }

    return lessonName.replace("Minna no Nihongo - ", "");
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Từ vựng yêu thích</h1>

      <p className={styles.description}>
        Danh sách các từ vựng bạn đã lưu để ôn tập lại nhanh hơn.
      </p>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && sortedFavorites.length === 0 && (
        <p className={styles.message}>Bạn chưa có từ vựng yêu thích nào</p>
      )}

      {!loading && !error && sortedFavorites.length > 0 && (
        <>
          <p className={styles.resultText}>
            Bạn đang lưu <strong>{sortedFavorites.length}</strong> từ yêu thích
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Từ vựng</th>
                  <th>Cách đọc</th>
                  <th>Nghĩa tiếng Việt</th>
                  <th>JLPT</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {paginatedFavorites.map((vocab) => (
                  <tr key={vocab.vocabulary_id}>
                    <td className={styles.wordCell}>{vocab.word}</td>
                    <td>{vocab.reading || "-"}</td>
                    <td>{vocab.vietnamese_meaning}</td>
                    <td>
                      <span className={styles.levelBadge}>
                        {vocab.jlpt_level}
                      </span>
                    </td>

                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.detailButton}
                          onClick={() => setSelectedVocabulary(vocab)}
                        >
                          Chi tiết
                        </button>

                        <button
                          className={styles.heartButton}
                          onClick={() =>
                            handleRemoveFavorite(vocab.vocabulary_id)
                          }
                          title="Bỏ yêu thích"
                        >
                          ♥
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Trước
            </button>

            <span>
              Trang {currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Sau
            </button>
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
              <span className={styles.levelBadge}>
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
              {selectedVocabulary.audio_url && (
                <button
                  className={styles.audioButton}
                  onClick={() => handlePlayAudio(selectedVocabulary)}
                >
                  Nghe phát âm
                </button>
              )}

              <button
                className={styles.removeButton}
                onClick={() =>
                  handleRemoveFavorite(selectedVocabulary.vocabulary_id)
                }
              >
                Bỏ yêu thích
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default FavoriteListPage;