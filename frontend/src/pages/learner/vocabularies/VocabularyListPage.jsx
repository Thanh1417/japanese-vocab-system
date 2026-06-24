import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { getAllVocabulariesApi } from "../../../api/vocabularyApi";
import { getAllLessonsApi } from "../../../api/lessonApi"; // THÊM MỚI: Import API lấy bài học
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
  const [lessons, setLessons] = useState([]); // THÊM MỚI: State lưu danh sách bài học
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [jlptLevel, setJlptLevel] = useState("");
  const [filterLessonId, setFilterLessonId] = useState(""); // THÊM MỚI: State lưu bài học đang lọc

  const [viewMode, setViewMode] = useState("table");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const fetchData = async () => {
    try {
      setError("");
      // THÊM MỚI: Gọi đồng thời 3 API (Từ vựng, Yêu thích, Bài học)
      const [vocabRes, favoriteRes, lessonRes] = await Promise.all([
        getAllVocabulariesApi(),
        getMyFavoritesApi(),
        getAllLessonsApi(),
      ]);

      const rawVocab = vocabRes?.data?.data || vocabRes?.data;
      const vocabData = Array.isArray(rawVocab) ? rawVocab : [];

      const rawFav = favoriteRes?.data?.data || favoriteRes?.data;
      const favoriteData = Array.isArray(rawFav) ? rawFav : [];

      const rawLessons = lessonRes?.data?.data || lessonRes?.data;
      const lessonData = Array.isArray(rawLessons) ? rawLessons : [];

      const ids = favoriteData.map((item) => {
        const vocab = item?.vocabulary || item;
        return vocab?.vocabulary_id;
      }).filter(id => id != null);

      setVocabularies(vocabData);
      setFavoriteIds(ids);
      setLessons(lessonData); // Lưu danh sách bài học
    } catch (error) {
      setError(error?.response?.data?.message || "Không thể tải danh sách từ vựng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFavorite = async (vocabularyId) => {
    if (!vocabularyId) return;
    try {
      if (favoriteIds.includes(vocabularyId)) {
        await removeFavoriteVocabularyApi(vocabularyId);
        setFavoriteIds((prev) => prev.filter((id) => id !== vocabularyId));
      } else {
        await addFavoriteVocabularyApi(vocabularyId);
        setFavoriteIds((prev) => [...prev, vocabularyId]);
      }
    } catch (error) {
      setError(error?.response?.data?.message || "Cập nhật yêu thích thất bại");
    }
  };

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

  // THÊM MỚI: Hàm format tên bài học (giống Admin)
  const formatLessonName = (lessonName) => {
    if (!lessonName) return "";
    return lessonName.replace("Minna no Nihongo - ", "");
  };

  // THÊM MỚI: Lọc danh sách bài học đổ vào Select dựa theo Cấp độ đang chọn
  const filteredLessonsForFilter = lessons
    .filter((lesson) => (jlptLevel ? lesson.jlpt_level === jlptLevel : true))
    .sort((a, b) => a.lesson_id - b.lesson_id);

  // CẬP NHẬT: Thêm điều kiện lọc theo Bài học
  const filteredVocabularies = vocabularies.filter((vocab) => {
    if (!vocab) return false;
    const searchText = keyword.toLowerCase();
    const matchKeyword =
      vocab.word?.toLowerCase().includes(searchText) ||
      vocab.reading?.toLowerCase().includes(searchText) ||
      vocab.vietnamese_meaning?.toLowerCase().includes(searchText);

    const matchLevel = jlptLevel ? vocab.jlpt_level === jlptLevel : true;
    const matchLesson = filterLessonId ? vocab.lesson_id === Number(filterLessonId) : true;

    return matchKeyword && matchLevel && matchLesson; // Bắt buộc thoả mãn cả 3 điều kiện
  });

  const jlptOrder = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };

  const sortedVocabularies = [...filteredVocabularies].sort((a, b) => {
    const valA = jlptOrder[a?.jlpt_level] || 0;
    const valB = jlptOrder[b?.jlpt_level] || 0;
    const levelCompare = valA - valB;
    if (levelCompare !== 0) return levelCompare;

    return (a?.vocabulary_id || 0) - (b?.vocabulary_id || 0);
  });

  const totalPages = Math.ceil(sortedVocabularies.length / itemsPerPage) || 1;
  const paginatedVocabularies = sortedVocabularies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>Danh sách từ vựng</h1>
        </div>

        <div className={styles.viewToggleGroup}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewActive : ''}`}
            onClick={() => setViewMode('table')}
            title="Xem dạng bảng"
          >
            ☰ Danh sách
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
            onClick={() => setViewMode('grid')}
            title="Xem dạng thẻ"
          >
            ⊞ Thẻ 
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className={styles.filterBox}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm từ, cách đọc hoặc nghĩa..."
          />
        </div>

        <select
          className={styles.select}
          value={jlptLevel}
          onChange={(e) => { 
            setJlptLevel(e.target.value); 
            setFilterLessonId(""); // Reset lại bài học khi đổi cấp độ
            setCurrentPage(1); 
          }}
        >
          <option value="">Tất cả cấp độ</option>
          <option value="N5">Cấp độ N5</option>
          <option value="N4">Cấp độ N4</option>
          <option value="N3">Cấp độ N3</option>
          <option value="N2">Cấp độ N2</option>
          <option value="N1">Cấp độ N1</option>
        </select>

        {/* THÊM MỚI: Ô Select lọc theo bài học */}
        <select
          className={styles.select}
          value={filterLessonId}
          onChange={(e) => { setFilterLessonId(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Tất cả bài học</option>
          {filteredLessonsForFilter.map((lesson) => (
            <option key={lesson.lesson_id} value={lesson.lesson_id}>
              {formatLessonName(lesson.lesson_name)}
            </option>
          ))}
        </select>
      </div>

      {loading && <LoadingMessage />}

      {!loading && !error && (
        <div className={styles.resultInfo}>
          Tìm thấy <span className={styles.highlight}>{sortedVocabularies.length}</span> từ vựng phù hợp
        </div>
      )}

      {!loading && !error && sortedVocabularies.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📂</div>
          <h3>Không tìm thấy từ vựng nào</h3>
          <p>Hãy thử thay đổi từ khóa hoặc bộ lọc cấp độ để tìm kiếm lại nhé!</p>
        </div>
      )}

      {!loading && !error && sortedVocabularies.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className={styles.grid}>
              {paginatedVocabularies.map((vocab) => (
                <VocabularyCard
                  key={vocab?.vocabulary_id}
                  vocabulary={vocab}
                  isFavorite={favoriteIds.includes(vocab?.vocabulary_id)}
                  onToggleFavorite={handleToggleFavorite}
                  onPlayAudio={() => handlePlayAudio(vocab?.reading || vocab?.word)}
                />
              ))}
            </div>
          ) : (
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
                  {paginatedVocabularies.map((vocab) => {
                    const isFav = favoriteIds.includes(vocab?.vocabulary_id);
                    return (
                      <tr key={vocab?.vocabulary_id} className={styles.tableRow}>
                        <td className={styles.vocabWord}>{vocab?.word}</td>
                        <td className={styles.vocabReading}>{vocab?.reading || "-"}</td>
                        <td className={styles.vocabKanji}>{vocab?.kanji_meaning || "-"}</td>
                        <td className={styles.vocabMeaning}>{vocab?.vietnamese_meaning}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[vocab?.jlpt_level] || ""}`}>
                            {vocab?.jlpt_level}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className={styles.actionGroup}>
                            <button
                              className={styles.audioBtnTable}
                              onClick={() => handlePlayAudio(vocab?.reading || vocab?.word)}
                              title="Nghe phát âm"
                            >
                              ▶
                            </button>
                            <button
                              className={`${styles.starBtnTable} ${isFav ? styles.starActive : ""}`}
                              onClick={() => handleToggleFavorite(vocab?.vocabulary_id)}
                              title={isFav ? "Bỏ yêu thích" : "Thêm yêu thích"}
                            >
                              {isFav ? "★" : "☆"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.paginationWrapper}>
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                &larr; Trước
              </button>
              <div className={styles.pageIndicator}>
                Trang <strong>{currentPage}</strong> / {totalPages}
              </div>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau &rarr;
              </button>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default VocabularyListPage;