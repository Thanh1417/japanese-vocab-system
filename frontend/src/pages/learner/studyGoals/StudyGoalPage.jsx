import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../../layouts/MainLayout";

import {
    createStudyGoalApi,
    deleteStudyGoalApi,
    getGoalDailyPlanApi,
    getMyStudyGoalsApi,
    updateStudyGoalApi,
} from "../../../api/studyGoalApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";
import SuccessMessage from "../../../components/common/SuccessMessage";

import styles from "./StudyGoalPage.module.css";

function StudyGoalPage() {
    const navigate = useNavigate();
    const [goals, setGoals] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [dailyPlan, setDailyPlan] = useState([]);

    const [loading, setLoading] = useState(true);
    const [planLoading, setPlanLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const today = new Date().toISOString().slice(0, 10);

    const [formData, setFormData] = useState({
        goal_name: "",
        jlpt_level: "N5",
        start_date: today,
        end_date: today,
        status: "active",
    });

    const fetchGoals = async () => {
        try {
            setError("");
            const res = await getMyStudyGoalsApi();
            const data = res.data.data || res.data;
            setGoals(data);
        } catch (error) {
            setError(error.response?.data?.message || "Không thể tải mục tiêu học tập");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const sortedGoals = [...goals].sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        return 0;
    });

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            goal_name: "",
            jlpt_level: "N5",
            start_date: today,
            end_date: today,
            status: "active",
        });
    };

    const openModal = (goal = null) => {
        if (goal) {
            setEditingId(goal.goal_id);
            setFormData({
                goal_name: goal.goal_name,
                jlpt_level: goal.jlpt_level,
                start_date: goal.start_date?.slice(0, 10),
                end_date: goal.end_date?.slice(0, 10),
                status: goal.status || "active",
            });
        } else {
            resetForm();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError("");
            setSuccess("");

            if (editingId) {
                await updateStudyGoalApi(editingId, formData);
                setSuccess("Cập nhật mục tiêu học tập thành công");
            } else {
                await createStudyGoalApi(formData);
                setSuccess("Tạo mục tiêu học tập thành công");
            }

            closeModal();
            fetchGoals();
        } catch (error) {
            setError(error.response?.data?.message || "Lưu mục tiêu thất bại");
        }
    };

    const handleDelete = async (goalId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xoá mục tiêu này không?")) return;

        try {
            setError("");
            setSuccess("");
            await deleteStudyGoalApi(goalId);
            setSuccess("Xoá mục tiêu học tập thành công");

            if (selectedGoal?.goal_id === goalId) {
                setSelectedGoal(null);
                setDailyPlan([]);
            }
            fetchGoals();
        } catch (error) {
            setError(error.response?.data?.message || "Xoá mục tiêu thất bại");
        }
    };

    const handleViewPlan = async (goal) => {
        try {
            setError("");
            setPlanLoading(true);
            setSelectedGoal(goal);

            const res = await getGoalDailyPlanApi(goal.goal_id);
            const data = res.data.data || res.data;
            setDailyPlan(data.plans || []);
        } catch (error) {
            setError(error.response?.data?.message || "Không thể tải kế hoạch mỗi ngày");
        } finally {
            setPlanLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("vi-VN");
    };

    const handleOpenDay = (day) => {
        navigate(`/study-goals/${selectedGoal.goal_id}/day/${day.day_number}`);
    };

    const getStatusText = (status) => {
        return status === "completed" ? "Đã hoàn thành" : "Đang học";
    };

    return (
        <MainLayout>
            <div className={styles.headerArea}>
                <div>
                    <h1 className={styles.title}>Mục tiêu học tập</h1>
                    <p className={styles.description}>
                        Tạo mục tiêu học từ vựng theo cấp độ JLPT
                    </p>
                </div>
                <button className={styles.addButton} onClick={() => openModal()}>
                    Thêm mục tiêu
                </button>
            </div>

            <ErrorMessage message={error} />
            <SuccessMessage message={success} />

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>{editingId ? "Cập nhật mục tiêu" : "Tạo mục tiêu học tập"}</h2>
                            <button className={styles.closeModalBtn} onClick={closeModal}>&times;</button>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Tên mục tiêu</label>
                                    <input
                                        name="goal_name"
                                        value={formData.goal_name}
                                        onChange={handleChange}
                                        placeholder="Ví dụ: Hoàn thành N5"
                                        className={styles.modalInput}
                                        required
                                    />
                                </div>

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

                                <div className={styles.formGroup}>
                                    <label>Ngày bắt đầu</label>
                                    <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className={styles.modalInput} required />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Ngày kết thúc</label>
                                    <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className={styles.modalInput} required />
                                </div>

                                {editingId && (
                                    <div className={styles.formGroup}>
                                        <label>Trạng thái</label>
                                        <select name="status" value={formData.status} onChange={handleChange} className={styles.modalInput}>
                                            <option value="active">Đang học</option>
                                            <option value="completed">Đã hoàn thành</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.submitButton} type="submit">
                                    {editingId ? "Cập nhật" : "Tạo mục tiêu"}
                                </button>
                                <button className={styles.cancelButton} type="button" onClick={closeModal}>
                                    Huỷ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading && <LoadingMessage />}

            {!loading && sortedGoals.length === 0 && (
                <p className={styles.message}>
                    Bạn chưa có mục tiêu học tập nào. Hãy tạo mục tiêu đầu tiên.
                </p>
            )}

            {!loading && sortedGoals.length > 0 && (
                <div className={styles.goalGrid}>
                    {sortedGoals.map((goal) => {
                        const isCompleted = goal.status === "completed";
                        const strokeColor = isCompleted ? "#10b981" : "#0ea5e9"; // Xanh lá nếu xong, xanh dương nếu đang học
                        const radius = 34;
                        const circumference = 2 * Math.PI * radius; // Chu vi đường tròn
                        const offset = circumference - (goal.progress / 100) * circumference;

                        return (
                            <div key={goal.goal_id} className={`${styles.goalCard} ${isCompleted ? styles.completedCard : ""}`}>
                                <div className={styles.goalHeader}>
                                    <h2>
                                        {goal.goal_name}
                                    </h2>
                                    <span className={`${styles.level} ${isCompleted ? styles.levelCompleted : ""}`}>
                                        {goal.jlpt_level}
                                    </span>
                                </div>

                                <div className={styles.goalBody}>
                                    <div className={styles.goalInfo}>
                                        <p><strong>Thời gian:</strong> {formatDate(goal.start_date)} - {formatDate(goal.end_date)}</p>
                                        <p><strong>Tiến độ từ vựng:</strong> {goal.learned_words || 0} / {goal.total_words}</p>
                                        <p><strong>Trạng thái: </strong>
                                            <span className={isCompleted ? styles.statusCompleted : styles.statusActive}>
                                                {getStatusText(goal.status)}
                                            </span>
                                        </p>
                                    </div>

                                    {/* SVG CIRCULAR PROGRESS BAR */}
                                    <div className={styles.progressCircleWrapper}>
                                        <svg width="84" height="84" className={styles.circularSvg}>
                                            <circle cx="42" cy="42" r={radius} className={styles.bgCircle} />
                                            <circle
                                                cx="42" cy="42" r={radius}
                                                className={styles.progressCircle}
                                                style={{
                                                    strokeDasharray: circumference,
                                                    strokeDashoffset: offset,
                                                    stroke: strokeColor
                                                }}
                                            />
                                        </svg>
                                        <div className={styles.progressText} style={{ color: strokeColor }}>
                                            {goal.progress}%
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    <button className={styles.viewButton} onClick={() => handleViewPlan(goal)}>Xem kế hoạch</button>
                                    <button className={styles.editButton} onClick={() => openModal(goal)}>Sửa</button>
                                    <button className={styles.deleteButton} onClick={() => handleDelete(goal.goal_id)}>Xoá</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedGoal && (
                <div className={styles.planSection}>
                    <h2>Kế hoạch học mỗi ngày</h2>
                    <p className={styles.description}>
                        Mục tiêu: <strong>{selectedGoal.goal_name}</strong> - {selectedGoal.jlpt_level}
                    </p>

                    {planLoading && <LoadingMessage text="Đang tải kế hoạch..." />}

                    {!planLoading && dailyPlan.length > 0 && (
                        <div className={styles.planGrid}>
                            {dailyPlan.map((day) => {
                                const isDayCompleted = day.progress === 100;
                                const dayStrokeColor = isDayCompleted ? "#10b981" : "#0ea5e9";
                                const dayRadius = 20;
                                const dayCircum = 2 * Math.PI * dayRadius;
                                const dayOffset = dayCircum - ((day.progress || 0) / 100) * dayCircum;

                                return (
                                    <div
                                        key={day.day_number}
                                        className={`${styles.planCard} ${isDayCompleted ? styles.planCardCompleted : ""}`}
                                        onClick={() => handleOpenDay(day)}
                                    >
                                        <div className={styles.planHeader}>
                                            <div className={styles.planHeaderLeft}>
                                                <h3>Ngày {day.day_number}</h3>
                                                <span>{formatDate(day.date)}</span>
                                            </div>

                                            {/* VÒNG TRÒN TIẾN ĐỘ CỦA TỪNG NGÀY */}
                                            <div className={styles.dayProgressWrapper}>
                                                <svg width="48" height="48" className={styles.circularSvg}>
                                                    <circle cx="24" cy="24" r={dayRadius} className={styles.bgCircle} style={{ strokeWidth: 4 }} />
                                                    <circle
                                                        cx="24" cy="24" r={dayRadius}
                                                        className={styles.progressCircle}
                                                        style={{
                                                            strokeDasharray: dayCircum,
                                                            strokeDashoffset: dayOffset,
                                                            stroke: dayStrokeColor,
                                                            strokeWidth: 4
                                                        }}
                                                    />
                                                </svg>
                                                <div className={styles.dayProgressText} style={{ color: dayStrokeColor }}>
                                                    {day.progress || 0}%
                                                </div>
                                            </div>
                                        </div>
                                        <p>
                                            <strong>{day.learned_words || 0} / {day.total_words}</strong> từ đã học
                                        </p>
                                        <ul>
                                            {day.words.slice(0, 5).map((word) => (
                                                <li key={word.vocabulary_id}>
                                                    {word.word} - {word.vietnamese_meaning}
                                                </li>
                                            ))}
                                        </ul>
                                        {day.words.length > 5 && (
                                            <p className={styles.moreText}>
                                                Và {day.words.length - 5} từ khác...
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </MainLayout>
    );
}

export default StudyGoalPage;