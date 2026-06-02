import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getAllLessonsApi } from "../../api/lessonApi";

function LessonListPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchLessons();
  }, []);

  return (
    <MainLayout>
      <h1>Quản lý bài học</h1>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && (
        <table border="1" cellPadding="10" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên bài học</th>
              <th>Cấp độ JLPT</th>
              <th>Tổng số từ</th>
            </tr>
          </thead>

          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.lesson_id}>
                <td>{lesson.lesson_id}</td>
                <td>{lesson.lesson_name}</td>
                <td>{lesson.jlpt_level}</td>
                <td>{lesson.total_words}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </MainLayout>
  );
}

export default LessonListPage;