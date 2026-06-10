import { useEffect, useState } from "react";
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

  const [editingId, setEditingId] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

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
      setError(
        error.response?.data?.message ||
          "Không thể tải dữ liệu câu hỏi"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const searchText = keyword.toLowerCase();

    const matchKeyword =
      question.content?.toLowerCase().includes(searchText) ||
      question.correct_answer?.toLowerCase().includes(searchText) ||
      question.vocabulary?.word?.toLowerCase().includes(searchText);

    const matchType = filterType
      ? question.question_type === filterType
      : true;

    const matchLevel = filterLevel
      ? question.vocabulary?.jlpt_level === filterLevel
      : true;

    return matchKeyword && matchType && matchLevel;
  });

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
      setError("");
      setSuccess("");

      if (editingId) {
        await updateQuestionApi(editingId, payload);

        setSuccess("Cập nhật câu hỏi thành công");
      } else {
        await createQuestionApi(payload);

        setSuccess("Thêm câu hỏi thành công");
      }

      resetForm();

      fetchData();
    } catch (error) {
      setError(
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
      setError("");
      setSuccess("");

      await deleteQuestionApi(questionId);

      setSuccess("Xoá câu hỏi thành công");

      fetchData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Xoá câu hỏi thất bại"
      );
    }
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>
        Quản lý câu hỏi
      </h1>

      <ErrorMessage message={error} />

      <SuccessMessage message={success} />

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
              <option value="">
                Chọn từ vựng
              </option>

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
              <option value="typing">
                Typing
              </option>

              <option value="multiple_choice">
                Multiple Choice
              </option>
            </select>
          </div>

          <div className={styles.formGroupFull}>
            <label>
              Nội dung câu hỏi
            </label>

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
            {editingId
              ? "Cập nhật"
              : "Thêm câu hỏi"}
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

      <div className={styles.filterBox}>
        <input
          className={styles.filterInput}
          value={keyword}
          onChange={(e) =>
            setKeyword(e.target.value)
          }
          placeholder="Tìm câu hỏi, đáp án hoặc từ vựng..."
        />

        <select
          className={styles.filterSelect}
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value)
          }
        >
          <option value="">
            Tất cả loại câu hỏi
          </option>

          <option value="typing">
            Typing
          </option>

          <option value="multiple_choice">
            Multiple Choice
          </option>
        </select>

        <select
          className={styles.filterSelect}
          value={filterLevel}
          onChange={(e) =>
            setFilterLevel(e.target.value)
          }
        >
          <option value="">
            Tất cả cấp độ
          </option>

          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>
      </div>

      <p className={styles.resultText}>
        Tìm thấy{" "}
        <strong>
          {filteredQuestions.length}
        </strong>{" "}
        câu hỏi
      </p>

      {loading && <LoadingMessage />}

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
                <th>JLPT</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredQuestions.map(
                (question) => (
                  <tr
                    key={
                      question.question_id
                    }
                  >
                    <td>
                      {
                        question.question_id
                      }
                    </td>

                    <td>
                      {
                        question.vocabulary
                          ?.word
                      }
                    </td>

                    <td>
                      {question.content}
                    </td>

                    <td>
                      {
                        question.correct_answer
                      }
                    </td>

                    <td>
                      {
                        question.question_type
                      }
                    </td>

                    <td>
                      {
                        question.vocabulary
                          ?.jlpt_level
                      }
                    </td>

                    <td>
                      <button
                        className={
                          styles.editButton
                        }
                        onClick={() =>
                          handleEdit(
                            question
                          )
                        }
                      >
                        Sửa
                      </button>

                      <button
                        className={
                          styles.deleteButton
                        }
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
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
}

export default QuestionManagementPage;