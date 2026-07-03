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
import ConfirmModal from "../../../components/common/ConfirmModal";

import styles from "./LessonListPage.module.css";

function LessonListPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [keyword, setKeyword] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Hiển thị 15 bài học mỗi trang

  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const openConfirm = (title, message, onConfirm, variant = 'danger') =>
    setConfirmModal({ isOpen: true, title, message, onConfirm, variant });
  const closeConfirm = () => setConfirmModal({ isOpen: false });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [formData, setFormData] = useState({
    lesson_name: "",
    jlpt_level: "N5",
  });

  const fetchLessons = async () => {
    try {
      setError("");
      const res = await getAllLessonsApi();
      setLessons(res.data.data || res.data);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải danh sách bài học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const filteredLessons = lessons.filter((lesson) => {
    const matchKeyword = lesson.lesson_name?.toLowerCase().includes(keyword.toLowerCase());
    const matchLevel = filterLevel ? lesson.jlpt_level === filterLevel : true;
    return matchKeyword && matchLevel;
  });

  const jlptOrder = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
  const sortedLessons = [...filteredLessons].sort((a, b) => {
    const levelCompare = jlptOrder[a.jlpt_level] - jlptOrder[b.jlpt_level];
    if (levelCompare !== 0) return levelCompare;
    return a.lesson_name.localeCompare(b.lesson_name, undefined, { numeric: true });
  });

  // Tính toán dữ liệu cho phân trang
  const totalPages = Math.ceil(sortedLessons.length / itemsPerPage);
  const paginatedLessons = sortedLessons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (lesson = null) => {
    if (lesson) {
      setEditingLessonId(lesson.lesson_id);
      setFormData({
        lesson_name: lesson.lesson_name,
        jlpt_level: lesson.jlpt_level,
      });
    } else {
      setEditingLessonId(null);
      setFormData({
        lesson_name: "",
        jlpt_level: filterLevel || "N5",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitLesson = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      if (editingLessonId) {
        await updateLessonApi(editingLessonId, formData);
        setSuccess("Cập nhật bài học thành công");
      } else {
        await createLessonApi(formData);
        setSuccess("Thêm bài học thành công");
      }

      closeModal();
      fetchLessons();
    } catch (error) {
      setError(error.response?.data?.message || "Lưu bài học thất bại");
    }
  };

  const handleDeleteLesson = (lessonId) => {
    openConfirm(
      "Xoá bài học",
      "CẢNH BÁO: Xoá bài học sẽ xoá toàn bộ từ vựng bên trong. Bạn chắc chắn chứ?",
      async () => {
        closeConfirm();
        try {
          setError("");
          setSuccess("");
          await deleteLessonApi(lessonId);
          setSuccess("Xoá bài học thành công");

          // Nếu xóa hết data ở trang cuối, tự động lùi về trang trước
          if (paginatedLessons.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
          fetchLessons();
        } catch (error) {
          setError(error.response?.data?.message || "Xoá bài học thất bại");
        }
      },
      'danger'
    );
  };

  return (
    <>
    <MainLayout>
      <div className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>Quản lý bài học</h1>
          <p className={styles.subtitle}>Sắp xếp và phân loại hệ thống bài học theo cấp độ JLPT</p>
        </div>
        <button className={styles.addButton} onClick={() => openModal()}>
          Thêm bài học
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className={styles.filterBox}>
        <input
          className={styles.filterInput}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
          }}
          placeholder="Nhập tên bài học cần tìm..."
        />
        <select
          className={styles.filterSelect}
          value={filterLevel}
          onChange={(e) => {
            setFilterLevel(e.target.value);
            setCurrentPage(1); // Reset về trang 1 khi lọc
          }}
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
                  <th width="auto">Tên bài học</th>
                  <th width="120px" style={{ textAlign: "center" }}>Cấp độ JLPT</th>
                  <th width="120px" style={{ textAlign: "center" }}>Tổng số từ</th>
                  <th width="140px" style={{ textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLessons.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "30px" }}>
                      Không tìm thấy bài học nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedLessons.map((lesson, index) => {
                    // Tính số thứ tự liên tục qua các trang
                    const realIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={lesson.lesson_id}>
                        <td className={styles.sttCol}>{realIndex}</td>
                        <td className={styles.nameCol}>{lesson.lesson_name}</td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`${styles.badge} ${styles[lesson.jlpt_level]}`}>
                            {lesson.jlpt_level}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <strong>{lesson.total_words || 0}</strong> từ vựng
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button className={styles.editButton} onClick={() => openModal(lesson)}>
                              Sửa
                            </button>
                            <button className={styles.deleteButton} onClick={() => handleDeleteLesson(lesson.lesson_id)}>
                              Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                disabled={currentPage === 1}
              >
                Trước
              </button>
              <span>Trang {currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingLessonId ? "Cập nhật bài học" : "Thêm bài học mới"}</h2>
              <button className={styles.closeModalBtn} onClick={closeModal}>&times;</button>
            </div>

            <form className={styles.form} onSubmit={handleSubmitLesson}>
              <div className={styles.formGroup}>
                <label>Tên bài học</label>
                <input
                  name="lesson_name"
                  value={formData.lesson_name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Bài 1"
                  required
                  className={styles.modalInput}
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label>Cấp độ JLPT</label>
                <select
                  name="jlpt_level"
                  value={formData.jlpt_level}
                  onChange={handleChange}
                  className={styles.modalInput}
                >
                  <option value="N5">N5</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                  <option value="N2">N2</option>
                  <option value="N1">N1</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.submitButton} type="submit">
                  {editingLessonId ? "Lưu thay đổi" : "Thêm bài học"}
                </button>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>
                  Huỷ bỏ
                </button>
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
      confirmText="Xoá bài học"
      cancelText="Huỷ"
      onConfirm={confirmModal.onConfirm}
      onCancel={closeConfirm}
    />
    </>
  );
}

export default LessonListPage;