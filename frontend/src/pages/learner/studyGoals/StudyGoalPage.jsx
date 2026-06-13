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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
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

            resetForm();
            fetchGoals();
        } catch (error) {
            setError(error.response?.data?.message || "Lưu mục tiêu thất bại");
        }
    };

    const handleEdit = (goal) => {
        setEditingId(goal.goal_id);

        setFormData({
            goal_name: goal.goal_name,
            jlpt_level: goal.jlpt_level,
            start_date: goal.start_date?.slice(0, 10),
            end_date: goal.end_date?.slice(0, 10),
            status: goal.status || "active",
        });
    };

    const handleDelete = async (goalId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xoá mục tiêu này không?")) {
            return;
        }

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
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleDateString();
    };

    const handleOpenDay = (day) => {
        navigate(`/study-goals/${selectedGoal.goal_id}/day/${day.day_number}`);
    };

    return (
        <MainLayout>
            <h1 className={styles.title}>Mục tiêu học tập</h1>

            <p className={styles.description}>
                Tạo mục tiêu học từ vựng theo cấp độ JLPT. Hệ thống sẽ tính số từ cần
                học mỗi ngày và sinh kế hoạch học theo từng ngày.
            </p>

            <ErrorMessage message={error} />
            <SuccessMessage message={success} />

            <form className={styles.form} onSubmit={handleSubmit}>
                <h2 className={styles.formTitle}>
                    {editingId ? "Cập nhật mục tiêu" : "Tạo mục tiêu học tập"}
                </h2>

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Tên mục tiêu</label>

                        <input
                            name="goal_name"
                            value={formData.goal_name}
                            onChange={handleChange}
                            placeholder="Ví dụ: Hoàn thành N5"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Cấp độ JLPT</label>

                        <select
                            name="jlpt_level"
                            value={formData.jlpt_level}
                            onChange={handleChange}
                        >
                            <option value="N5">N5</option>
                            <option value="N4">N4</option>
                            <option value="N3">N3</option>
                            <option value="N2">N2</option>
                            <option value="N1">N1</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày bắt đầu</label>

                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Ngày kết thúc</label>

                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.submitButton} type="submit">
                        {editingId ? "Cập nhật" : "Tạo mục tiêu"}
                    </button>

                    {editingId && (
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

            {!loading && goals.length === 0 && (
                <p className={styles.message}>
                    Bạn chưa có mục tiêu học tập nào. Hãy tạo mục tiêu đầu tiên.
                </p>
            )}

            {!loading && goals.length > 0 && (
                <div className={styles.goalGrid}>
                    {goals.map((goal) => (
                        <div key={goal.goal_id} className={styles.goalCard}>
                            <div className={styles.goalHeader}>
                                <h2>{goal.goal_name}</h2>
                                <span className={styles.level}>{goal.jlpt_level}</span>
                            </div>

                            <p>
                                <strong>Thời gian:</strong> {formatDate(goal.start_date)} -{" "}
                                {formatDate(goal.end_date)}
                            </p>

                            <p>
                                <strong>Tổng số từ:</strong> {goal.total_words}
                            </p>

                            <p>
                                <strong>Số từ mỗi ngày:</strong> {goal.daily_words}
                            </p>

                            <p>
                                <strong>Trạng thái:</strong> {goal.status}
                            </p>

                            <div className={styles.cardActions}>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => handleViewPlan(goal)}
                                >
                                    Xem kế hoạch
                                </button>

                                <button
                                    className={styles.editButton}
                                    onClick={() => handleEdit(goal)}
                                >
                                    Sửa
                                </button>

                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDelete(goal.goal_id)}
                                >
                                    Xoá
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedGoal && (
                <div className={styles.planSection}>
                    <h2>Kế hoạch học mỗi ngày</h2>

                    <p className={styles.description}>
                        Mục tiêu: <strong>{selectedGoal.goal_name}</strong> -{" "}
                        {selectedGoal.jlpt_level}
                    </p>

                    {planLoading && <LoadingMessage text="Đang tải kế hoạch..." />}

                    {!planLoading && dailyPlan.length > 0 && (
                        <div className={styles.planGrid}>
                            {dailyPlan.map((day) => (
                                <div
                                    key={day.day_number}
                                    className={styles.planCard}
                                    onClick={() => handleOpenDay(day)}
                                >
                                    <div className={styles.planHeader}>
                                        <h3>Ngày {day.day_number}</h3>
                                        <span>{formatDate(day.date)}</span>
                                    </div>

                                    <p>
                                        <strong>{day.total_words}</strong> từ cần học
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
                            ))}
                        </div>
                    )}
                </div>
            )}
        </MainLayout>
    );
}

export default StudyGoalPage;