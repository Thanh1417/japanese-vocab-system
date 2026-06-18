import { useEffect, useState, useRef } from "react";
import MainLayout from "../../../layouts/MainLayout";

import {
  createVocabularyApi,
  deleteVocabularyApi,
  getAllVocabulariesApi,
  updateVocabularyApi,
  searchVocabularyApi,
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

  // Phân trang & Lọc
  const [keyword, setKeyword] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterLessonId, setFilterLessonId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Trạng thái Modal (Popup)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Trạng thái Autocomplete cho Từ vựng
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef(null);

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
      setError(error.response?.data?.message || "Không thể tải dữ liệu từ vựng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Tắt dropdown gợi ý từ vựng khi click ra ngoài
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lọc và Sắp xếp danh sách ở bảng
  const filteredVocabularies = vocabularies.filter((vocab) => {
    const searchText = keyword.toLowerCase();
    const matchKeyword =
      vocab.word?.toLowerCase().includes(searchText) ||
      vocab.reading?.toLowerCase().includes(searchText) ||
      vocab.vietnamese_meaning?.toLowerCase().includes(searchText);

    const matchLevel = filterLevel ? vocab.jlpt_level === filterLevel : true;
    const matchLesson = filterLessonId ? vocab.lesson_id === Number(filterLessonId) : true;

    return matchKeyword && matchLevel && matchLesson;
  });

  const jlptOrder = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };

  const sortedVocabularies = [...filteredVocabularies].sort((a, b) => {
    const levelCompare = jlptOrder[a.jlpt_level] - jlptOrder[b.jlpt_level];
    if (levelCompare !== 0) return levelCompare;

    const lessonCompare = a.lesson_id - b.lesson_id;
    if (lessonCompare !== 0) return lessonCompare;

    return a.vocabulary_id - b.vocabulary_id;
  });

  const totalPages = Math.ceil(sortedVocabularies.length / itemsPerPage);
  const paginatedVocabularies = sortedVocabularies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatLessonName = (lessonName) => {
    if (!lessonName) return "";
    return lessonName.replace("Minna no Nihongo - ", "");
  };

  const filteredLessonsForFilter = lessons
    .filter((lesson) => (filterLevel ? lesson.jlpt_level === filterLevel : true))
    .sort((a, b) => a.lesson_id - b.lesson_id);

  // Lọc bài học cho Form Modal (Dựa vào cấp độ đang chọn trong form)
  const modalLessons = lessons
    .filter((lesson) => lesson.jlpt_level === formData.jlpt_level)
    .sort((a, b) => a.lesson_id - b.lesson_id);

  // Xử lý đóng mở Modal
  const openModal = (vocab = null) => {
    if (vocab) {
      setEditingId(vocab.vocabulary_id);
      setFormData({
        lesson_id: vocab.lesson_id || "",
        word: vocab.word || "",
        reading: vocab.reading || "",
        kanji_meaning: vocab.kanji_meaning || "",
        vietnamese_meaning: vocab.vietnamese_meaning || "",
        example_sentence: vocab.example_sentence || "",
        audio_url: vocab.audio_url || "", // Vẫn giữ liệu cũ nếu có
        jlpt_level: vocab.jlpt_level || "N5",
      });
    } else {
      setEditingId(null);
      setFormData({
        lesson_id: "",
        word: "",
        reading: "",
        kanji_meaning: "",
        vietnamese_meaning: "",
        example_sentence: "",
        audio_url: "",
        jlpt_level: "N5", // Default
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
    setSuccess("");
    setShowSuggestions(false);
  };

  // Xử lý thay đổi input thông thường
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Nếu đổi cấp độ JLPT, reset lại bài học vì bài học cũ có thể không thuộc cấp độ mới
    if (name === "jlpt_level") {
      newFormData.lesson_id = "";
    }

    setFormData(newFormData);
  };

  // Xử lý Autocomplete cho Từ vựng
  const handleWordChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, word: value });

    if (value.trim().length > 0) {
      try {
        const res = await searchVocabularyApi(value);
        setSuggestions(res.data.data || res.data);
        setShowSuggestions(true);
      } catch (error) {
        console.log(error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (vocab) => {
    setFormData({
      ...formData,
      word: vocab.word,
      reading: vocab.reading || "",
      kanji_meaning: vocab.kanji_meaning || "",
      vietnamese_meaning: vocab.vietnamese_meaning || "",
      example_sentence: vocab.example_sentence || "",
      audio_url: vocab.audio_url || "",
    });
    setShowSuggestions(false);
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

      closeModal();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Lưu từ vựng thất bại");
    }
  };

  const handleDelete = async (vocabularyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá từ vựng này không?")) return;
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

  // Hàm phát âm Text-to-Speech
  const playAudio = (text) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.lang = 'ja-JP';
      
      // 1. Chỉnh tốc độ (Rate): Mặc định là 1
      utterance.rate = 1; 
      
      // 2. Chỉnh âm lượng (Volume): Mặc định là 1 (tối đa). Đảm bảo luôn phát ra tiếng to nhất.
      utterance.volume = 1; 

      // 3. Chỉnh giọng đọc (Voice): Tìm và ép chọn giọng nữ
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoices = voices.filter(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');

      if (japaneseVoices.length > 0) {
        // Ưu tiên các giọng nữ nổi tiếng: Google (Android/Chrome), Kyoko (Mac/iOS), Haruka/Nanami (Windows)
        const femaleVoice = japaneseVoices.find(v => 
          v.name.includes('Google') || 
          v.name.includes('Kyoko') || 
          v.name.includes('Haruka') ||
          v.name.includes('Nanami')
        );
        
        // Nếu tìm thấy giọng nữ ưu tiên thì dùng, không thì lấy giọng tiếng Nhật đầu tiên có sẵn
        utterance.voice = femaleVoice || japaneseVoices[0];
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt không hỗ trợ phát âm.");
    }
  };

  return (
    <MainLayout>
      <div className={styles.headerArea}>
        <h1 className={styles.title}>Quản lý từ vựng</h1>
        <button className={styles.addButton} onClick={() => openModal()}>
          Thêm từ vựng
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className={styles.filterBox}>
        <input
          className={styles.filterInput}
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
          placeholder="Tìm từ, cách đọc hoặc nghĩa..."
        />
        <select
          className={styles.filterSelect}
          value={filterLevel}
          onChange={(e) => { setFilterLevel(e.target.value); setFilterLessonId(""); setCurrentPage(1); }}
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
                  <th style={{ textAlign: "center" }}>Phát âm</th>
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
                    <td className={styles.kanjiText}>{vocab.word}</td>
                    <td>{vocab.reading}</td>
                    
                    {/* NÚT PHÁT ÂM */}
                    <td style={{ textAlign: "center" }}>
                      <button 
                        type="button"
                        className={styles.playAudioBtn} 
                        onClick={() => playAudio(vocab.reading || vocab.word)}
                        title="Nghe phát âm"
                      >
                        ▶
                      </button>
                    </td>

                    <td>{vocab.kanji_meaning || "-"}</td>
                    <td>{vocab.vietnamese_meaning}</td>
                    <td>{vocab.jlpt_level}</td>
                    <td>{formatLessonName(vocab.lesson?.lesson_name) || vocab.lesson_id}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button className={styles.editButton} onClick={() => openModal(vocab)}>Sửa</button>
                        <button className={styles.deleteButton} onClick={() => handleDelete(vocab.vocabulary_id)}>Xoá</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Trước</button>
            <span>Trang {currentPage} / {totalPages || 1}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>Sau</button>
          </div>
        </>
      )}

      {/* POPUP MODAL THÊM/SỬA TỪ VỰNG */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? "Cập nhật từ vựng" : "Thêm từ vựng mới"}</h2>
              <button className={styles.closeModalBtn} onClick={closeModal}>&times;</button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                
                {/* 1. Chọn Cấp độ JLPT */}
                <div className={styles.formGroup}>
                  <label>Cấp độ JLPT</label>
                  <select name="jlpt_level" value={formData.jlpt_level} onChange={handleChange} className={styles.modalInput}>
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1</option>
                  </select>
                </div>

                {/* 2. Chọn Bài học (Được lọc theo Cấp độ ở trên) */}
                <div className={styles.formGroup}>
                  <label>Bài học</label>
                  <select name="lesson_id" value={formData.lesson_id} onChange={handleChange} required className={styles.modalInput}>
                    <option value="">Chọn bài học</option>
                    {modalLessons.map((lesson) => (
                      <option key={lesson.lesson_id} value={lesson.lesson_id}>
                        {formatLessonName(lesson.lesson_name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Nhập Từ vựng (Có Autocomplete) */}
                <div className={styles.formGroup} ref={autocompleteRef}>
                  <label>Từ vựng (Nhập để tìm kiếm mẫu)</label>
                  <div className={styles.autocompleteWrapper}>
                    <input
                      name="word"
                      value={formData.word}
                      onChange={handleWordChange}
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                      placeholder="Ví dụ: 日本"
                      required
                      autoComplete="off"
                      className={styles.modalInput}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className={styles.suggestionsList}>
                        {suggestions.map((item) => (
                          <li key={item.vocabulary_id} className={styles.suggestionItem} onClick={() => handleSelectSuggestion(item)}>
                            <span className={styles.suggWord}>{item.word}</span>
                            <span className={styles.suggMeaning}>{item.vietnamese_meaning}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* 4. Cách đọc */}
                <div className={styles.formGroup}>
                  <label>Cách đọc</label>
                  <input name="reading" value={formData.reading} onChange={handleChange} placeholder="Ví dụ: にほん" className={styles.modalInput} />
                </div>

                {/* 5. Hán tự */}
                <div className={styles.formGroup}>
                  <label>Hán tự</label>
                  <input name="kanji_meaning" value={formData.kanji_meaning} onChange={handleChange} placeholder="Ví dụ: Nhật Bản" className={styles.modalInput} />
                </div>

                {/* 6. Nghĩa tiếng Việt */}
                <div className={styles.formGroup}>
                  <label>Nghĩa tiếng Việt</label>
                  <input name="vietnamese_meaning" value={formData.vietnamese_meaning} onChange={handleChange} placeholder="Ví dụ: Nước Nhật Bản" required className={styles.modalInput} />
                </div>

                {/* Đã xóa field nhập Audio URL ở đây */}

                {/* 7. Ví dụ */}
                <div className={styles.formGroupFull}>
                  <label>Ví dụ</label>
                  <textarea name="example_sentence" value={formData.example_sentence} onChange={handleChange} placeholder="Ví dụ: 私は学生です。" rows="3" className={styles.modalTextarea} />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.submitButton} type="submit">
                  {editingId ? "Cập nhật" : "Lưu từ vựng"}
                </button>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default VocabularyManagementPage;