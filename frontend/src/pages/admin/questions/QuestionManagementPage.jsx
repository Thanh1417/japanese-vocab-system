import { useEffect, useState, useRef } from "react";
import MainLayout from "../../../layouts/MainLayout";

import {
  createQuestionApi,
  deleteQuestionApi,
  getAllQuestionsApi,
  updateQuestionApi,
} from "../../../api/questionApi";

import { getAllVocabulariesApi } from "../../../api/vocabularyApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";
import SuccessMessage from "../../../components/common/SuccessMessage";

import styles from "./QuestionManagementPage.module.css";

function QuestionManagementPage() {
  const [questions, setQuestions] = useState([]);
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Phân trang & Lọc
  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Trạng thái cho Modal (Popup)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Trạng thái cho Autocomplete Tìm kiếm từ vựng
  const [vocabSearchTerm, setVocabSearchTerm] = useState("");
  const [showVocabSuggestions, setShowVocabSuggestions] = useState(false);
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState({
    vocabulary_id: "",
    content: "",
    question_type: "typing",
    correct_answer: "",
  });

  const fetchData = async () => {
    try {
      setError("");
      const [questionRes, vocabularyRes] = await Promise.all([
        getAllQuestionsApi(),
        getAllVocabulariesApi(),
      ]);

      setQuestions(questionRes.data.data || questionRes.data);
      setVocabularies(vocabularyRes.data.data || vocabularyRes.data);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Tắt dropdown từ vựng khi click ra ngoài
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowVocabSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logic lọc và sắp xếp danh sách câu hỏi
  const filteredQuestions = questions.filter((question) => {
    const searchText = keyword.toLowerCase();
    const matchKeyword =
      question.content?.toLowerCase().includes(searchText) ||
      question.correct_answer?.toLowerCase().includes(searchText) ||
      question.vocabulary?.word?.toLowerCase().includes(searchText);

    const matchType = filterType ? question.question_type === filterType : true;
    const matchLevel = filterLevel ? question.vocabulary?.jlpt_level === filterLevel : true;

    return matchKeyword && matchType && matchLevel;
  });

  const jlptOrder = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    const levelCompare = jlptOrder[a.vocabulary?.jlpt_level] - jlptOrder[b.vocabulary?.jlpt_level];
    if (levelCompare !== 0) return levelCompare;
    return a.question_id - b.question_id;
  });

  const totalPages = Math.ceil(sortedQuestions.length / itemsPerPage);
  const paginatedQuestions = sortedQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mở & Đóng Modal
  const openModal = (question = null) => {
    if (question) {
      setEditingId(question.question_id);
      setFormData({
        vocabulary_id: question.vocabulary_id,
        content: question.content,
        question_type: question.question_type,
        correct_answer: question.correct_answer,
      });
      setVocabSearchTerm(question.vocabulary?.word || "");
    } else {
      setEditingId(null);
      setFormData({
        vocabulary_id: "",
        content: "",
        question_type: "typing",
        correct_answer: "",
      });
      setVocabSearchTerm("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
  };

  // Logic Autocomplete tìm kiếm từ vựng local
  const filteredVocabulariesForSearch = vocabularies.filter(v => 
    v.word?.toLowerCase().includes(vocabSearchTerm.toLowerCase()) ||
    v.vietnamese_meaning?.toLowerCase().includes(vocabSearchTerm.toLowerCase())
  ).slice(0, 15); // Lấy tối đa 15 kết quả để UI không bị lag

  const handleSelectVocab = (vocab) => {
    setVocabSearchTerm(vocab.word);
    setShowVocabSuggestions(false);
    
    // Tự động điền nội dung và đáp án luôn là Nghĩa Tiếng Việt
    setFormData({
      ...formData,
      vocabulary_id: vocab.vocabulary_id,
      content: `${vocab.word} có nghĩa là gì?`,
      correct_answer: vocab.vietnamese_meaning || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let newFormData = { ...formData, [name]: value };

    // Nếu đổi loại câu hỏi mà đã có từ vựng rồi, vẫn set lại câu hỏi về Nghĩa Tiếng Việt
    if (name === "question_type" && newFormData.vocabulary_id) {
       const selectedVocab = vocabularies.find(v => v.vocabulary_id === Number(newFormData.vocabulary_id));
       if (selectedVocab) {
         newFormData.content = `${selectedVocab.word} có nghĩa là gì?`;
         newFormData.correct_answer = selectedVocab.vietnamese_meaning || "";
       }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vocabulary_id) {
        setError("Vui lòng tìm và chọn một từ vựng!");
        return;
    }

    const payload = {
      ...formData,
      vocabulary_id: Number(formData.vocabulary_id),
    };

    try {
      setError("");
      setSuccess("");

      if (editingId) {
        await updateQuestionApi(editingId, payload);
        setSuccess("Cập nhật câu hỏi thành công");
      } else {
        await createQuestionApi(payload);
        setSuccess("Thêm câu hỏi thành công");
      }

      closeModal();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Lưu câu hỏi thất bại");
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá?")) return;
    try {
      setError("");
      setSuccess("");
      await deleteQuestionApi(questionId);
      setSuccess("Xoá câu hỏi thành công");
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Xoá câu hỏi thất bại");
    }
  };

  return (
    <MainLayout>
      <div className={styles.headerArea}>
        <h1 className={styles.title}>Quản lý câu hỏi</h1>
        <button className={styles.addButton} onClick={() => openModal()}>
          Thêm câu hỏi
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className={styles.filterBox}>
        <input
          className={styles.filterInput}
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
          placeholder="Tìm câu hỏi, đáp án hoặc từ vựng..."
        />
        <select
          className={styles.filterSelect}
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Tất cả loại câu hỏi</option>
          <option value="typing">Typing</option>
          <option value="multiple_choice">Multiple Choice</option>
        </select>
        <select
          className={styles.filterSelect}
          value={filterLevel}
          onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Tất cả cấp độ</option>
          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>
      </div>

      <p className={styles.resultText}>
        Tìm thấy <strong>{sortedQuestions.length}</strong> câu hỏi
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
                  <th>Nội dung</th>
                  <th>Đáp án</th>
                  <th>Loại</th>
                  <th>JLPT</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuestions.map((question) => (
                  <tr key={question.question_id}>
                    <td>{question.question_id}</td>
                    <td>{question.vocabulary?.word}</td>
                    <td>{question.content}</td>
                    <td>{question.correct_answer}</td>
                    <td>{question.question_type}</td>
                    <td>{question.vocabulary?.jlpt_level}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button className={styles.editButton} onClick={() => openModal(question)}>Sửa</button>
                        <button className={styles.deleteButton} onClick={() => handleDelete(question.question_id)}>Xoá</button>
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

      {/* POPUP MODAL THÊM/SỬA CÂU HỎI */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}</h2>
              <button className={styles.closeModalBtn} onClick={closeModal}>&times;</button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                
                {/* Ô TÌM KIẾM TỪ VỰNG AUTOCOMPLETE */}
                <div className={styles.formGroup} ref={autocompleteRef}>
                  <label>Tìm chọn Từ vựng</label>
                  <div className={styles.autocompleteWrapper}>
                    <input
                      type="text"
                      className={styles.modalInput}
                      value={vocabSearchTerm}
                      onChange={(e) => {
                        setVocabSearchTerm(e.target.value);
                        setShowVocabSuggestions(true);
                        setFormData({...formData, vocabulary_id: ""}); // Reset id nếu gõ từ mới
                      }}
                      onFocus={() => setShowVocabSuggestions(true)}
                      placeholder="Gõ tiếng Nhật hoặc nghĩa..."
                      required
                    />
                    {showVocabSuggestions && vocabSearchTerm && (
                      <ul className={styles.suggestionsList}>
                        {filteredVocabulariesForSearch.map(v => (
                          <li key={v.vocabulary_id} className={styles.suggestionItem} onClick={() => handleSelectVocab(v)}>
                            <span className={styles.suggWord}>{v.word}</span>
                            <span className={styles.suggMeaning}>{v.vietnamese_meaning}</span>
                          </li>
                        ))}
                        {filteredVocabulariesForSearch.length === 0 && (
                          <li className={styles.suggestionItem}>Không tìm thấy từ vựng</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Loại câu hỏi</label>
                  <select
                    className={styles.modalInput}
                    name="question_type"
                    value={formData.question_type}
                    onChange={handleChange}
                  >
                    <option value="typing">Typing</option>
                    <option value="multiple_choice">Multiple Choice</option>
                  </select>
                </div>

                <div className={styles.formGroupFull}>
                  <label>Nội dung câu hỏi (Tự động điền)</label>
                  <textarea
                    className={styles.modalTextarea}
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label>Đáp án đúng (Tự động điền)</label>
                  <input
                    className={styles.modalInput}
                    name="correct_answer"
                    value={formData.correct_answer}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.submitButton} type="submit">
                  {editingId ? "Cập nhật" : "Lưu câu hỏi"}
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

export default QuestionManagementPage;