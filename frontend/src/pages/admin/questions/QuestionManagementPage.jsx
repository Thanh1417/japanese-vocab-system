import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";

import {
  createQuestionApi,
  deleteQuestionApi,
  getAllQuestionsApi,
  updateQuestionApi,
} from "../../../api/questionApi";

import { getAllVocabulariesApi } from "../../../api/vocabularyApi";

import styles from "./QuestionManagementPage.module.css";

function QuestionManagementPage() {
  const [questions, setQuestions] = useState([]);
  const [vocabularies, setVocabularies] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    vocabulary_id: "",
    content: "",
    question_type: "typing",
    correct_answer: "",
  });

  const fetchData = async () => {
    try {
      const [questionRes, vocabularyRes] = await Promise.all([
        getAllQuestionsApi(),
        getAllVocabulariesApi(),
      ]);

      setQuestions(questionRes.data.data || questionRes.data);

      setVocabularies(
        vocabularyRes.data.data || vocabularyRes.data
      );
    } catch (error) {
      alert("Không thể tải dữ liệu câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      vocabulary_id: "",
      content: "",
      question_type: "typing",
      correct_answer: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      vocabulary_id: Number(formData.vocabulary_id),
    };

    try {
      if (editingId) {
        await updateQuestionApi(editingId, payload);

        alert("Cập nhật câu hỏi thành công");
      } else {
        await createQuestionApi(payload);

        alert("Thêm câu hỏi thành công");
      }

      resetForm();
      fetchData();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Lưu câu hỏi thất bại"
      );
    }
  };

  const handleEdit = (question) => {
    setEditingId(question.question_id);

    setFormData({
      vocabulary_id: question.vocabulary_id,
      content: question.content,
      question_type: question.question_type,
      correct_answer: question.correct_answer,
    });
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá?")) {
      return;
    }

    try {
      await deleteQuestionApi(questionId);

      alert("Xoá câu hỏi thành công");

      fetchData();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Xoá câu hỏi thất bại"
      );
    }
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Quản lý câu hỏi</h1>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <h2 className={styles.formTitle}>
          {editingId
            ? "Cập nhật câu hỏi"
            : "Thêm câu hỏi"}
        </h2>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Từ vựng</label>

            <select
              name="vocabulary_id"
              value={formData.vocabulary_id}
              onChange={handleChange}
              required
            >
              <option value="">Chọn từ vựng</option>

              {vocabularies.map((vocab) => (
                <option
                  key={vocab.vocabulary_id}
                  value={vocab.vocabulary_id}
                >
                  {vocab.word}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Loại câu hỏi</label>

            <select
              name="question_type"
              value={formData.question_type}
              onChange={handleChange}
            >
              <option value="typing">Typing</option>
              <option value="multiple_choice">
                Multiple Choice
              </option>
            </select>
          </div>

          <div className={styles.formGroupFull}>
            <label>Nội dung câu hỏi</label>

            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className={styles.formGroupFull}>
            <label>Đáp án đúng</label>

            <input
              name="correct_answer"
              value={formData.correct_answer}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.submitButton}
            type="submit"
          >
            {editingId ? "Cập nhật" : "Thêm câu hỏi"}
          </button>

          {editingId && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={resetForm}
            >
              Huỷ
            </button>
          )}
        </div>
      </form>

      {loading && (
        <p className={styles.message}>
          Đang tải dữ liệu...
        </p>
      )}

      {!loading && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Từ vựng</th>
                <th>Nội dung</th>
                <th>Đáp án</th>
                <th>Loại</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {questions.map((question) => (
                <tr key={question.question_id}>
                  <td>{question.question_id}</td>

                  <td>
                    {question.vocabulary?.word}
                  </td>

                  <td>{question.content}</td>

                  <td>
                    {question.correct_answer}
                  </td>

                  <td>
                    {question.question_type}
                  </td>

                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() =>
                        handleEdit(question)
                      }
                    >
                      Sửa
                    </button>

                    <button
                      className={styles.deleteButton}
                      onClick={() =>
                        handleDelete(
                          question.question_id
                        )
                      }
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}

export default QuestionManagementPage;