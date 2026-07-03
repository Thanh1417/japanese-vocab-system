import { useEffect, useState, useRef } from "react";
import MainLayout from "../../../layouts/MainLayout";

import {
  createQuestionApi,
  deleteQuestionApi,
  getAllQuestionsApi,
  updateQuestionApi,
  autoGenerateQuestionsApi,
} from "../../../api/questionApi";
import { getAllVocabulariesApi } from "../../../api/vocabularyApi";
import { getAllLessonsApi } from "../../../api/lessonApi"; 

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";
import SuccessMessage from "../../../components/common/SuccessMessage";
import ConfirmModal from "../../../components/common/ConfirmModal";

import styles from "./QuestionManagementPage.module.css";

function QuestionManagementPage() {
  const [questions, setQuestions] = useState([]);
  const [vocabularies, setVocabularies] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [selectedLessonForAuto, setSelectedLessonForAuto] = useState("");
  const [autoGenerateType, setAutoGenerateType] = useState("both");

  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const openConfirm = (title, message, onConfirm, variant = 'danger') =>
    setConfirmModal({ isOpen: true, title, message, onConfirm, variant });
  const closeConfirm = () => setConfirmModal({ isOpen: false });

  // State quản lý việc hiển thị dropdown nào đang mở ('vocab', 'w1', 'w2', 'w3')
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [vocabSearchTerm, setVocabSearchTerm] = useState("");
  
  // Dùng 1 ref chung bao quanh toàn bộ form để phát hiện click ra ngoài
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    vocabulary_id: "",
    content: "",
    question_type: "typing",
    correct_answer: "",
    wrong_1: "",
    wrong_2: "",
    wrong_3: "",
  });

  const fetchData = async () => {
    try {
      setError("");
      const [questionRes, vocabularyRes, lessonRes] = await Promise.all([
        getAllQuestionsApi(),
        getAllVocabulariesApi(),
        getAllLessonsApi(),
      ]);
      setQuestions(questionRes.data.data || questionRes.data);
      setVocabularies(vocabularyRes.data.data || vocabularyRes.data);
      setLessons(lessonRes.data.data || lessonRes.data);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setActiveDropdown(null); // Đóng tất cả dropdown nếu click ra ngoài form
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    return b.question_id - a.question_id; 
  });

  const totalPages = Math.ceil(sortedQuestions.length / itemsPerPage);
  const paginatedQuestions = sortedQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (question = null) => {
    if (question) {
      setEditingId(question.question_id);
      
      let w1 = "", w2 = "", w3 = "";
      if (question.question_type === 'multiple_choice' && Array.isArray(question.options)) {
        const wrongs = question.options.filter(opt => opt !== question.correct_answer);
        w1 = wrongs[0] || "";
        w2 = wrongs[1] || "";
        w3 = wrongs[2] || "";
      }

      setFormData({
        vocabulary_id: question.vocabulary_id,
        content: question.content,
        question_type: question.question_type,
        correct_answer: question.correct_answer,
        wrong_1: w1,
        wrong_2: w2,
        wrong_3: w3,
      });
      setVocabSearchTerm(question.vocabulary?.word || "");
    } else {
      setEditingId(null);
      setFormData({
        vocabulary_id: "",
        content: "",
        question_type: "typing",
        correct_answer: "",
        wrong_1: "",
        wrong_2: "",
        wrong_3: "",
      });
      setVocabSearchTerm("");
    }
    setActiveDropdown(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsAutoModalOpen(false);
    setError("");
  };

  // Hàm lọc gợi ý cho TỪ VỰNG CHÍNH
  const filteredVocabulariesForSearch = vocabularies.filter(v =>
    v.word?.toLowerCase().includes(vocabSearchTerm.toLowerCase()) ||
    v.vietnamese_meaning?.toLowerCase().includes(vocabSearchTerm.toLowerCase())
  ).slice(0, 15);

  const handleSelectVocab = (vocab) => {
    setVocabSearchTerm(vocab.word);
    setActiveDropdown(null);
    setFormData({
      ...formData,
      vocabulary_id: vocab.vocabulary_id,
      content: formData.question_type === "typing" ? `${vocab.word} có nghĩa là gì?` : `Chọn nghĩa đúng của từ: ${vocab.word}`,
      correct_answer: vocab.vietnamese_meaning || "",
    });
  };

  // Hàm lọc gợi ý cho ĐÁP ÁN NHIỄU (Chỉ tìm theo nghĩa tiếng Việt)
  const getWrongAnswerSuggestions = (searchTerm) => {
    if (!searchTerm) return [];
    return vocabularies.filter(v =>
      v.vietnamese_meaning?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    if (name === "question_type" && newFormData.vocabulary_id) {
      const selectedVocab = vocabularies.find(v => v.vocabulary_id === Number(newFormData.vocabulary_id));
      if (selectedVocab) {
        newFormData.content = newFormData.question_type === "typing" ? `${selectedVocab.word} có nghĩa là gì?` : `Chọn nghĩa đúng của từ: ${selectedVocab.word}`;
      }
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vocabulary_id) {
      setError("Vui lòng tìm và chọn một từ vựng!"); return;
    }

    let finalOptions = null;
    if (formData.question_type === 'multiple_choice') {
      if (!formData.wrong_1 || !formData.wrong_2 || !formData.wrong_3) {
        setError("Vui lòng nhập đủ 3 đáp án nhiễu cho câu trắc nghiệm!"); return;
      }
      const rawOptions = [formData.correct_answer, formData.wrong_1, formData.wrong_2, formData.wrong_3];
      finalOptions = rawOptions.sort(() => Math.random() - 0.5);
    }

    const payload = { 
      vocabulary_id: Number(formData.vocabulary_id),
      content: formData.content,
      question_type: formData.question_type,
      correct_answer: formData.correct_answer,
      options: finalOptions
    };

    try {
      setError(""); setSuccess("");
      if (editingId) {
        await updateQuestionApi(editingId, payload);
        setSuccess("Cập nhật câu hỏi thành công");
      } else {
        await createQuestionApi(payload);
        setSuccess("Thêm câu hỏi thành công");
      }
      closeModal(); fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Lưu câu hỏi thất bại");
    }
  };

  const handleDelete = (questionId) => {
    openConfirm(
      "Xoá câu hỏi",
      "Bạn có chắc chắn muốn xoá câu hỏi này không?",
      async () => {
        closeConfirm();
        try {
          setError(""); setSuccess("");
          await deleteQuestionApi(questionId);
          setSuccess("Xoá câu hỏi thành công");
          fetchData();
        } catch (error) {
          setError(error.response?.data?.message || "Xoá câu hỏi thất bại");
        }
      },
      'danger'
    );
  };

  const handleAutoGenerate = async () => {
    if (!selectedLessonForAuto) return;
    try {
      setLoading(true);
      setError("");
      await autoGenerateQuestionsApi(selectedLessonForAuto, { 
        generate_type: autoGenerateType 
      });
      setSuccess("Đã tạo câu hỏi tự động thành công!");
      closeModal();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Tạo câu hỏi thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <MainLayout>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>Quản lý câu hỏi</h1>
          <p className={styles.subtitle}>Tạo câu hỏi trắc nghiệm, tự luận theo bài học</p>
        </div>
        <div className={styles.actionGroup}>
          <button className={styles.autoButton} onClick={() => setIsAutoModalOpen(true)}>
            Tạo câu hỏi tự động
          </button>
          <button className={styles.addButton} onClick={() => openModal()}>
            Thêm câu hỏi
          </button>
        </div>
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
          <option value="">Tất cả loại hình</option>
          <option value="typing">Tự luận (Typing)</option>
          <option value="multiple_choice">Trắc nghiệm (Choice)</option>
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

      {loading && <LoadingMessage />}

      {!loading && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th width="60px" style={{ textAlign: "center" }}>STT</th>
                  <th width="120px">Từ vựng</th>
                  <th>Nội dung câu hỏi</th>
                  <th>Đáp án đúng</th>
                  <th width="120px" style={{ textAlign: "center" }}>Loại</th>
                  <th width="100px" style={{ textAlign: "center" }}>JLPT</th>
                  <th width="140px" style={{ textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuestions.map((question, index) => {
                  const realIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={question.question_id}>
                      <td className={styles.sttCol}>{realIndex}</td>
                      <td className={styles.kanjiText}>{question.vocabulary?.word}</td>
                      <td>
                        <div className={styles.questionContent}>{question.content}</div>
                        {question.question_type === 'multiple_choice' && question.options && (
                          <div className={styles.optionsWrapper}>
                            {Array.isArray(question.options) ? question.options.map((opt, i) => (
                              <span
                                key={i}
                                className={`${styles.optionTag} ${opt === question.correct_answer ? styles.optionCorrect : styles.optionWrong}`}
                              >
                                {String.fromCharCode(65 + i)}. {opt}
                              </span>
                            )) : null}
                          </div>
                        )}
                      </td>
                      <td className={styles.correctText}>{question.correct_answer}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={question.question_type === 'typing' ? styles.tagTyping : styles.tagChoice}>
                          {question.question_type === 'typing' ? 'Tự luận' : 'Trắc nghiệm'}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`${styles.badge} ${styles[question.vocabulary?.jlpt_level]}`}>
                          {question.vocabulary?.jlpt_level}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button className={styles.editButton} onClick={() => openModal(question)}>Sửa</button>
                          <button className={styles.deleteButton} onClick={() => handleDelete(question.question_id)}>Xoá</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Trước</button>
              <span>Trang {currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Sau</button>
            </div>
          )}
        </>
      )}

      {/* POPUP: TẠO CÂU HỎI TỰ ĐỘNG */}
      {isAutoModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Tạo câu hỏi tự động</h2>
              <button className={styles.closeModalBtn} onClick={closeModal}>&times;</button>
            </div>
            <div className={styles.formGroup}>
              <label>Chọn Bài học để tạo câu hỏi</label>
              <select className={styles.modalInput} value={selectedLessonForAuto} onChange={e => setSelectedLessonForAuto(e.target.value)}>
                <option value="">Lựa chọn bài học</option>
                {lessons.map(ls => <option key={ls.lesson_id} value={ls.lesson_id}>{ls.lesson_name} ({ls.jlpt_level})</option>)}
              </select>
            </div>
           <div className={styles.formGroup}>
              <label>Loại câu hỏi muốn tạo</label>
              <select className={styles.modalInput} value={autoGenerateType} onChange={e => setAutoGenerateType(e.target.value)}>
                <option value="both">Cả hai (Tự luận & Trắc nghiệm)</option>
                <option value="typing">Tự luận</option>
                <option value="multiple_choice">Trắc nghiệm</option>
              </select>
           </div>
            <div className={styles.modalActions}>
              <button className={styles.autoGenerateBtn} onClick={handleAutoGenerate} disabled={!selectedLessonForAuto}>
                Bắt đầu tạo
              </button>
              <button type="button" className={styles.cancelButton} onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: THÊM/SỬA THỦ CÔNG */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} ref={formRef}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}</h2>
              <button className={styles.closeModalBtn} onClick={closeModal}>&times;</button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                
                {/* AUTOCOMPLETE: TÌM TỪ VỰNG CHÍNH */}
                <div className={styles.formGroup}>
                  <label>Tìm chọn từ vựng</label>
                  <div className={styles.autocompleteWrapper}>
                    <input
                      type="text"
                      className={styles.modalInput}
                      value={vocabSearchTerm}
                      onChange={(e) => {
                        setVocabSearchTerm(e.target.value);
                        setActiveDropdown('vocab');
                        setFormData({ ...formData, vocabulary_id: "" });
                      }}
                      onFocus={() => setActiveDropdown('vocab')}
                      placeholder="Nhập tiếng Nhật hoặc nghĩa..."
                      required
                      autoComplete="off"
                    />
                    {activeDropdown === 'vocab' && vocabSearchTerm && (
                      <ul className={styles.suggestionsList}>
                        {filteredVocabulariesForSearch.map(v => (
                          <li key={v.vocabulary_id} className={styles.suggestionItem} onClick={() => handleSelectVocab(v)}>
                            <span className={styles.suggWord}>{v.word}</span>
                            <span className={styles.suggMeaning}>{v.vietnamese_meaning}</span>
                          </li>
                        ))}
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
                    <option value="typing">Tự luận</option>
                    <option value="multiple_choice">Trắc nghiệm</option>
                  </select>
                </div>

                <div className={styles.formGroupFull}>
                  <label>Nội dung câu hỏi</label>
                  <textarea
                    className={styles.modalInput}
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="2"
                    required
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label>Đáp án đúng</label>
                  <input
                    className={styles.modalInput}
                    name="correct_answer"
                    value={formData.correct_answer}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* CHỈ HIỂN THỊ 3 ĐÁP ÁN NHIỄU NẾU LÀ TRẮC NGHIỆM */}
                {formData.question_type === 'multiple_choice' && (
                  <>
                    <div className={styles.formGroupFull} style={{marginTop: "8px"}}>
                      <label style={{color: "#ef4444"}}>Các đáp án nhiễu (Nhập tay hoặc chọn từ gợi ý)</label>
                    </div>
                    
                    {/* VÒNG LẶP RENDER 3 Ô NHẬP ĐÁP ÁN NHIỄU */}
                    {[1, 2, 3].map((num) => (
                      <div className={styles.formGroup} key={num}>
                        <div className={styles.autocompleteWrapper}>
                          <input
                            className={styles.modalInput}
                            name={`wrong_${num}`}
                            value={formData[`wrong_${num}`]}
                            onChange={handleChange}
                            onFocus={() => setActiveDropdown(`w${num}`)}
                            placeholder={`Đáp án nhiễu ${num}...`}
                            required
                            autoComplete="off"
                          />
                          {activeDropdown === `w${num}` && formData[`wrong_${num}`] && (
                            <ul className={styles.suggestionsList}>
                              {getWrongAnswerSuggestions(formData[`wrong_${num}`]).map((v, idx) => (
                                <li 
                                  key={idx} 
                                  className={styles.suggestionItem} 
                                  onClick={() => {
                                    setFormData({...formData, [`wrong_${num}`]: v.vietnamese_meaning});
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <span className={styles.suggMeaning}>{v.vietnamese_meaning}</span>
                                  <span className={styles.suggWord} style={{fontSize: "12px", marginLeft: "8px"}}>- {v.word}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}

              </div>

              <div className={styles.modalActions}>
                <button className={styles.submitButton} type="submit">
                  {editingId ? "Lưu thay đổi" : "Thêm câu hỏi"}
                </button>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>Huỷ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
    <ConfirmModal
      isOpen={confirmModal.isOpen}
      title={confirmModal.title}
      message={confirmModal.message}
      variant={confirmModal.variant}
      confirmText="Xoá"
      cancelText="Huỷ"
      onConfirm={confirmModal.onConfirm}
      onCancel={closeConfirm}
    />
    </>
  );
}

export default QuestionManagementPage;