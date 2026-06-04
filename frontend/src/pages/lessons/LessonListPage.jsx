import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
  createLessonApi,
  deleteLessonApi,
  getAllLessonsApi,
  updateLessonApi,
} from "../../api/lessonApi";

function LessonListPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [lessonName, setLessonName] = useState("");
  const [jlptLevel, setJlptLevel] = useState("N5");
  const [editingLessonId, setEditingLessonId] = useState(null);

  const fetchLessons = async () => {
    try {
      const res = await getAllLessonsApi();
      setLessons(res.data.data || res.data);
    } catch (error) {
      console.log(error);
      alert("Không thể tải danh sách bài học");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setLessonName("");
    setJlptLevel("N5");
    setEditingLessonId(null);
  };

  const handleSubmitLesson = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        lesson_name: lessonName,
        jlpt_level: jlptLevel,
      };

      if (editingLessonId) {
        await updateLessonApi(editingLessonId, payload);
        alert("Cập nhật bài học thành công");
      } else {
        await createLessonApi(payload);
        alert("Thêm bài học thành công");
      }

      resetForm();
      fetchLessons();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Lưu bài học thất bại");
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLessonId(lesson.lesson_id);
    setLessonName(lesson.lesson_name);
    setJlptLevel(lesson.jlpt_level);
  };

  const handleDeleteLesson = async (lessonId) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xoá bài học này không?"
    );

    if (!confirmDelete) return;

    try {
      await deleteLessonApi(lessonId);
      alert("Xoá bài học thành công");
      fetchLessons();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Xoá bài học thất bại");
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  return (
    <MainLayout>
      <h1>Quản lý bài học</h1>

      <form
        onSubmit={handleSubmitLesson}
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <h3>{editingLessonId ? "Cập nhật bài học" : "Thêm bài học"}</h3>

        <div>
          <label>Tên bài học</label>
          <br />
          <input
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            placeholder="Ví dụ: Bài 1 - Giới thiệu"
            required
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Cấp độ JLPT</label>
          <br />
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

        <button type="submit" style={{ marginTop: "12px" }}>
          {editingLessonId ? "Cập nhật" : "Thêm bài học"}
        </button>

        {editingLessonId && (
          <button
            type="button"
            onClick={resetForm}
            style={{ marginLeft: "10px" }}
          >
            Huỷ
          </button>
        )}
      </form>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && (
        <table border="1" cellPadding="10" width="100%">
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
                  <button onClick={() => handleEditLesson(lesson)}>
                    Sửa
                  </button>

                  <button
                    onClick={() => handleDeleteLesson(lesson.lesson_id)}
                    style={{ marginLeft: "8px" }}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </MainLayout>
  );
}

export default LessonListPage;