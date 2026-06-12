import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";

import {
  createVocabularyApi,
  deleteVocabularyApi,
  getAllVocabulariesApi,
  updateVocabularyApi,
} from "../../../api/vocabularyApi";

import { getAllLessonsApi } from "../../../api/lessonApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";
import SuccessMessage from "../../../components/common/SuccessMessage";

import styles from "./VocabularyManagementPage.module.css";

function VocabularyManagementPage() {
  const [vocabularies, setVocabularies] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterLessonId, setFilterLessonId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [formData, setFormData] = useState({
    lesson_id: "",
    word: "",
    reading: "",
    kanji_meaning: "",
    vietnamese_meaning: "",
    example_sentence: "",
    audio_url: "",
    jlpt_level: "N5",
  });

  const fetchData = async () => {
    try {
      setError("");

      const [vocabularyRes, lessonRes] = await Promise.all([
        getAllVocabulariesApi(),
        getAllLessonsApi(),
      ]);

      setVocabularies(vocabularyRes.data.data || vocabularyRes.data);
      setLessons(lessonRes.data.data || lessonRes.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải dữ liệu từ vựng"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredVocabularies = vocabularies.filter((vocab) => {
    const searchText = keyword.toLowerCase();

    const matchKeyword =
      vocab.word?.toLowerCase().includes(searchText) ||
      vocab.reading?.toLowerCase().includes(searchText) ||
      vocab.vietnamese_meaning?.toLowerCase().includes(searchText);

    const matchLevel = filterLevel ? vocab.jlpt_level === filterLevel : true;

    const matchLesson = filterLessonId
      ? vocab.lesson_id === Number(filterLessonId)
      : true;

    return matchKeyword && matchLevel && matchLesson;
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

  const filteredLessons = lessons
    .filter((lesson) => {
      return filterLevel ? lesson.jlpt_level === filterLevel : true;
    })
    .sort((a, b) => a.lesson_id - b.lesson_id);

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      lesson_id: "",
      word: "",
      reading: "",
      kanji_meaning: "",
      vietnamese_meaning: "",
      example_sentence: "",
      audio_url: "",
      jlpt_level: "N5",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleChangeKeyword = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handleChangeLevel = (e) => {
    setFilterLevel(e.target.value);
    setFilterLessonId("");
    setCurrentPage(1);
  };

  const handleChangeLesson = (e) => {
    setFilterLessonId(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      lesson_id: Number(formData.lesson_id),
    };

    try {
      setError("");
      setSuccess("");

      if (editingId) {
        await updateVocabularyApi(editingId, payload);
        setSuccess("Cập nhật từ vựng thành công");
      } else {
        await createVocabularyApi(payload);
        setSuccess("Thêm từ vựng thành công");
      }

      resetForm();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Lưu từ vựng thất bại");
    }
  };

  const handleEdit = (vocab) => {
    setEditingId(vocab.vocabulary_id);

    setFormData({
      lesson_id: vocab.lesson_id || "",
      word: vocab.word || "",
      reading: vocab.reading || "",
      kanji_meaning: vocab.kanji_meaning || "",
      vietnamese_meaning: vocab.vietnamese_meaning || "",
      example_sentence: vocab.example_sentence || "",
      audio_url: vocab.audio_url || "",
      jlpt_level: vocab.jlpt_level || "N5",
    });
  };

  const handleDelete = async (vocabularyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá từ vựng này không?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteVocabularyApi(vocabularyId);

      setSuccess("Xoá từ vựng thành công");

      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Xoá từ vựng thất bại");
    }
  };

  const formatLessonName = (lessonName) => {
    if (!lessonName) {
      return "";
    }

    return lessonName.replace("Minna no Nihongo - ", "");
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Quản lý từ vựng</h1>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.formTitle}>
          {editingId ? "Cập nhật từ vựng" : "Thêm từ vựng"}
        </h2>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Bài học</label>

            <select
              name="lesson_id"
              value={formData.lesson_id}
              onChange={handleChange}
              required
            >
              <option value="">Chọn bài học</option>

              {filteredLessons.map((lesson) => (
                <option key={lesson.lesson_id} value={lesson.lesson_id}>
                  {formatLessonName(lesson.lesson_name)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Từ vựng</label>

            <input
              name="word"
              value={formData.word}
              onChange={handleChange}
              placeholder="Ví dụ: 日本"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Cách đọc</label>

            <input
              name="reading"
              value={formData.reading}
              onChange={handleChange}
              placeholder="Ví dụ: にほん"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Hán tự</label>

            <input
              name="kanji_meaning"
              value={formData.kanji_meaning}
              onChange={handleChange}
              placeholder="Ví dụ: Nhật Bản"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nghĩa tiếng Việt</label>

            <input
              name="vietnamese_meaning"
              value={formData.vietnamese_meaning}
              onChange={handleChange}
              placeholder="Ví dụ: Nhật Bản"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Cấp độ JLPT</label>

            <select
              name="jlpt_level"
              value={formData.jlpt_level}
              onChange={handleChange}
            >
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
              <option value="N2">N2</option>
              <option value="N1">N1</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Audio URL</label>

            <input
              name="audio_url"
              value={formData.audio_url}
              onChange={handleChange}
              placeholder="Link audio nếu có"
            />
          </div>

          <div className={styles.formGroupFull}>
            <label>Ví dụ</label>

            <textarea
              name="example_sentence"
              value={formData.example_sentence}
              onChange={handleChange}
              placeholder="Ví dụ: 私は学生です。"
              rows="3"
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.submitButton} type="submit">
            {editingId ? "Cập nhật" : "Thêm từ vựng"}
          </button>

          {editingId && (
            <button
              className={styles.cancelButton}
              type="button"
              onClick={resetForm}
            >
              Huỷ
            </button>
          )}
        </div>
      </form>

      <div className={styles.filterBox}>
        <input
          className={styles.filterInput}
          value={keyword}
          onChange={handleChangeKeyword}
          placeholder="Tìm từ, cách đọc hoặc nghĩa..."
        />

        <select
          className={styles.filterSelect}
          value={filterLevel}
          onChange={handleChangeLevel}
        >
          <option value="">Tất cả cấp độ</option>
          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filterLessonId}
          onChange={handleChangeLesson}
        >
          <option value="">Tất cả bài học</option>

          {filteredLessons.map((lesson) => (
            <option key={lesson.lesson_id} value={lesson.lesson_id}>
              {formatLessonName(lesson.lesson_name)}
            </option>
          ))}
        </select>
      </div>

      <p className={styles.resultText}>
        Tìm thấy <strong>{sortedVocabularies.length}</strong> từ vựng
      </p>

      {loading && <LoadingMessage />}

      {!loading && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Từ vựng</th>
                  <th>Cách đọc</th>
                  <th>Âm Hán</th>
                  <th>Nghĩa</th>
                  <th>JLPT</th>
                  <th>Bài học</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {paginatedVocabularies.map((vocab) => (
                  <tr key={vocab.vocabulary_id}>
                    <td>{vocab.vocabulary_id}</td>
                    <td>{vocab.word}</td>
                    <td>{vocab.reading}</td>
                    <td>{vocab.kanji_meaning || "-"}</td>
                    <td>{vocab.vietnamese_meaning}</td>
                    <td>{vocab.jlpt_level}</td>
                    <td>{formatLessonName(vocab.lesson?.lesson_name) || vocab.lesson_id}</td>

                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(vocab)}
                        >
                          Sửa
                        </button>

                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(vocab.vocabulary_id)}
                        >
                          Xoá
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
    </MainLayout>
  );
}

export default VocabularyManagementPage;