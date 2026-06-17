import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../../layouts/MainLayout";
import { getGoalDayDetailApi } from "../../../api/studyGoalApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import styles from "./GoalDayDetailPage.module.css";

function GoalDayDetailPage() {
  const { goalId, dayNumber } = useParams();
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [dayDetail, setDayDetail] = useState(null);
  const [words, setWords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDayDetail = async () => {
    try {
      setError("");

      const res = await getGoalDayDetailApi(goalId, dayNumber);
      const data = res.data.data || res.data;

      setGoal(data.goal);
      setDayDetail(data);
      setWords(data.words || []);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải chi tiết ngày học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayDetail();
  }, [goalId, dayNumber]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const goToFlashcard = () => {
    navigate(`/flashcards?goalId=${goalId}&day=${dayNumber}`);
  };

  const goToMultipleChoice = () => {
    navigate(`/quiz?goalId=${goalId}&day=${dayNumber}&mode=multiple_choice`);
  };

  const goToTypingQuiz = () => {
    navigate(`/quiz?goalId=${goalId}&day=${dayNumber}&mode=typing`);
  };

  // Tính toán các thông số cho vòng tròn tiến độ
  const progress = dayDetail?.progress || 0;
  const isCompleted = progress === 100;
  const strokeColor = isCompleted ? "#10b981" : "#0ea5e9";
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <MainLayout>
      <h1 className={styles.title}>Kế hoạch học ngày {dayNumber}</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && dayDetail && (
        <>
          <div className={`${styles.summaryCard} ${isCompleted ? styles.completedCard : ""}`}>
            <div className={styles.summaryContent}>
              <h2>
                {goal?.goal_name}
                {isCompleted && <span className={styles.checkIcon}>✅</span>}
              </h2>

              <p><strong>Cấp độ:</strong> {goal?.jlpt_level}</p>
              <p><strong>Ngày học:</strong> {formatDate(dayDetail.date)}</p>
              <p><strong>Tiến độ:</strong> {dayDetail.learned_words || 0} / {dayDetail.total_words} từ</p>
              <p>
                <strong>Trạng thái: </strong>
                <span className={isCompleted ? styles.statusCompleted : styles.statusActive}>
                  {isCompleted ? "Đã hoàn thành" : "Đang học"}
                </span>
              </p>

              <div className={styles.studyActions}>
                <button onClick={goToFlashcard}>Học Flashcard</button>
                <button onClick={goToMultipleChoice}>Trắc nghiệm</button>
                <button onClick={goToTypingQuiz}>Tự luận</button>
              </div>
            </div>

            {/* VÒNG TRÒN TIẾN ĐỘ */}
            <div className={styles.progressCircleWrapper}>
              <svg width="84" height="84" className={styles.circularSvg}>
                <circle cx="42" cy="42" r={radius} className={styles.bgCircle} />
                <circle
                  cx="42" cy="42" r={radius}
                  className={styles.progressCircle}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    stroke: strokeColor,
                  }}
                />
              </svg>
              <div className={styles.progressText} style={{ color: strokeColor }}>
                {progress}%
              </div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Danh sách từ vựng</h2>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Từ vựng</th>
                  <th>Cách đọc</th>
                  <th>Âm Hán</th>
                  <th>Nghĩa tiếng Việt</th>
                  <th>JLPT</th>
                </tr>
              </thead>

              <tbody>
                {words.map((word) => (
                  <tr key={word.vocabulary_id}>
                    <td>{word.vocabulary_id}</td>
                    <td>{word.word}</td>
                    <td>{word.reading}</td>
                    <td>{word.kanji_meaning || "-"}</td>
                    <td>{word.vietnamese_meaning}</td>
                    <td>{word.jlpt_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default GoalDayDetailPage;