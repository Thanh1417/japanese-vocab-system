import { useEffect, useState } from "react";

import MainLayout from "../../../layouts/MainLayout";
import { getAllVocabulariesApi } from "../../../api/vocabularyApi";
import {
  getMyFavoritesApi,
  addFavoriteVocabularyApi,
  removeFavoriteVocabularyApi,
} from "../../../api/favoriteApi";

import VocabularyCard from "../../../components/vocabulary/VocabularyCard";
import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import styles from "./VocabularyListPage.module.css";

function VocabularyListPage() {
  const [vocabularies, setVocabularies] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [jlptLevel, setJlptLevel] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const fetchData = async () => {
    try {
      setError("");

      const [vocabRes, favoriteRes] = await Promise.all([
        getAllVocabulariesApi(),
        getMyFavoritesApi(),
      ]);

      const vocabData = vocabRes.data.data || vocabRes.data;
      const favoriteData = favoriteRes.data.data || favoriteRes.data;

      const ids = favoriteData.map((item) => {
        const vocab = item.vocabulary || item;
        return vocab.vocabulary_id;
      });

      setVocabularies(vocabData);
      setFavoriteIds(ids);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải danh sách từ vựng"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFavorite = async (vocabularyId) => {
    try {
      if (favoriteIds.includes(vocabularyId)) {
        await removeFavoriteVocabularyApi(vocabularyId);

        setFavoriteIds((prev) =>
          prev.filter((id) => id !== vocabularyId)
        );
      } else {
        await addFavoriteVocabularyApi(vocabularyId);

        setFavoriteIds((prev) => [...prev, vocabularyId]);
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Cập nhật yêu thích thất bại"
      );
    }
  };

  const filteredVocabularies = vocabularies.filter((vocab) => {
    const searchText = keyword.toLowerCase();

    const matchKeyword =
      vocab.word?.toLowerCase().includes(searchText) ||
      vocab.reading?.toLowerCase().includes(searchText) ||
      vocab.vietnamese_meaning?.toLowerCase().includes(searchText);

    const matchLevel = jlptLevel ? vocab.jlpt_level === jlptLevel : true;

    return matchKeyword && matchLevel;
  });

  const jlptOrder = {
    N5: 1,
    N4: 2,
    N3: 3,
    N2: 4,
    N1: 5,
  };

  const sortedVocabularies = [...filteredVocabularies].sort((a, b) => {
    const levelCompare = jlptOrder[a.jlpt_level] - jlptOrder[b.jlpt_level];

    if (levelCompare !== 0) {
      return levelCompare;
    }

    const lessonCompare = a.lesson_id - b.lesson_id;

    if (lessonCompare !== 0) {
      return lessonCompare;
    }

    return a.vocabulary_id - b.vocabulary_id;
  });

  const totalPages = Math.ceil(sortedVocabularies.length / itemsPerPage);

  const paginatedVocabularies = sortedVocabularies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChangeKeyword = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handleChangeLevel = (e) => {
    setJlptLevel(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Danh sách từ vựng</h1>

      <ErrorMessage message={error} />

      <div className={styles.filterBox}>
        <input
          className={styles.searchInput}
          value={keyword}
          onChange={handleChangeKeyword}
          placeholder="Tìm từ, cách đọc hoặc nghĩa..."
        />

        <select
          className={styles.select}
          value={jlptLevel}
          onChange={handleChangeLevel}
        >
          <option value="">Tất cả cấp độ</option>
          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>
      </div>

      {loading && <LoadingMessage />}

      {!loading && !error && (
        <p className={styles.resultText}>
          Tìm thấy <strong>{sortedVocabularies.length}</strong> từ vựng
        </p>
      )}

      {!loading && !error && (
        <>
          <div className={styles.grid}>
            {paginatedVocabularies.map((vocab) => (
              <VocabularyCard
                key={vocab.vocabulary_id}
                vocabulary={vocab}
                isFavorite={favoriteIds.includes(vocab.vocabulary_id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
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

export default VocabularyListPage;