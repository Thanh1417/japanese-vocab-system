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
    if (!window.confirm("Bạn có chắc muốn xoá từ này khỏi yêu thích không?")) {
      return;
    }

    try {
      setError("");

      await removeFavoriteVocabularyApi(vocabularyId);

      fetchFavorites();

      if (paginatedFavorites.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Xoá yêu thích thất bại");
    }
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Từ vựng yêu thích</h1>

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
                  <th>Âm Hán</th>
                  <th>Nghĩa tiếng Việt</th>
                  <th>JLPT</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {paginatedFavorites.map((vocab) => (
                  <tr key={vocab.vocabulary_id}>
                    <td>{vocab.word}</td>
                    <td>{vocab.reading}</td>
                    <td>{vocab.kanji_meaning || "-"}</td>
                    <td>{vocab.vietnamese_meaning}</td>
                    <td>{vocab.jlpt_level}</td>

                    <td>
                      <button
                        className={styles.deleteButton}
                        onClick={() =>
                          handleRemoveFavorite(vocab.vocabulary_id)
                        }
                      >
                        Xoá khỏi yêu thích
                      </button>
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
    </MainLayout>
  );
}

export default FavoriteListPage;