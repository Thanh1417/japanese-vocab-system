import { useEffect, useState } from "react";

import MainLayout from "../../../layouts/MainLayout";

import {
  createLessonApi,
  deleteLessonApi,
  getAllLessonsApi,
  updateLessonApi,
} from "../../../api/lessonApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";
import SuccessMessage from "../../../components/common/SuccessMessage";

import styles from "./LessonListPage.module.css";

function LessonListPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [lessonName, setLessonName] = useState("");
  const [jlptLevel, setJlptLevel] = useState("N5");
  const [editingLessonId, setEditingLessonId] = useState(null);

  const fetchLessons = async () => {
    try {
      setError("");

      const res = await getAllLessonsApi();
      setLessons(res.data.data || res.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể tải danh sách bài học"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const resetForm = () => {
    setLessonName("");
    setJlptLevel("N5");
    setEditingLessonId(null);
  };

  const handleSubmitLesson = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      const payload = {
        lesson_name: lessonName,
        jlpt_level: jlptLevel,
      };

      if (editingLessonId) {
        await updateLessonApi(editingLessonId, payload);
        setSuccess("Cập nhật bài học thành công");
      } else {
        await createLessonApi(payload);
        setSuccess("Thêm bài học thành công");
      }

      resetForm();
      fetchLessons();
    } catch (error) {
      setError(error.response?.data?.message || "Lưu bài học thất bại");
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLessonId(lesson.lesson_id);
    setLessonName(lesson.lesson_name);
    setJlptLevel(lesson.jlpt_level);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá bài học này không?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteLessonApi(lessonId);

      setSuccess("Xoá bài học thành công");
      fetchLessons();
    } catch (error) {
      setError(error.response?.data?.message || "Xoá bài học thất bại");
    }
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Quản lý bài học</h1>

      <ErrorMessage message={error} />

      <SuccessMessage message={success} />

      <form className={styles.form} onSubmit={handleSubmitLesson}>
        <h2 className={styles.formTitle}>
          {editingLessonId ? "Cập nhật bài học" : "Thêm bài học"}
        </h2>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Tên bài học</label>

            <input
              value={lessonName}
              onChange={(e) => setLessonName(e.target.value)}
              placeholder="Ví dụ: Bài 1 - Chào hỏi"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Cấp độ JLPT</label>

            <select
              value={jlptLevel}
              onChange={(e) => setJlptLevel(e.target.value)}
            >
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
              <option value="N2">N2</option>
              <option value="N1">N1</option>
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.submitButton} type="submit">
            {editingLessonId ? "Cập nhật" : "Thêm bài học"}
          </button>

          {editingLessonId && (
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

      {loading && <LoadingMessage />}

      {!loading && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên bài học</th>
                <th>Cấp độ JLPT</th>
                <th>Tổng số từ</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.lesson_id}>
                  <td>{lesson.lesson_id}</td>
                  <td>{lesson.lesson_name}</td>
                  <td>{lesson.jlpt_level}</td>
                  <td>{lesson.total_words}</td>
                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditLesson(lesson)}
                    >
                      Sửa
                    </button>

                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteLesson(lesson.lesson_id)}
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

export default LessonListPage;