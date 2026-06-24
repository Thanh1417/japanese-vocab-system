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

  // Luồng điều hướng dẫn thẳng vào bài học
  const handleNavigate = (mode) => {
    navigate(`/quiz?goalId=${goalId}&day=${dayNumber}&mode=${mode}`);
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "";

  const progress = dayDetail?.progress || 0;
  const isCompleted = progress === 100;
  const strokeColor = isCompleted ? "#10b981" : "#3b82f6";
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <MainLayout>
      <h1 className={styles.title}>Lộ trình học ngày {dayNumber}</h1>
      <ErrorMessage message={error} />
      {loading && <LoadingMessage />}

      {!loading && dayDetail && (
        <>
          <div className={`${styles.summaryCard} ${isCompleted ? styles.completedCard : ""}`}>
            <div className={styles.summaryContent}>
              <h2 className={styles.goalName}>
                {goal?.goal_name} {isCompleted}
              </h2>
              <div className={styles.metaInfo}>
                <span><strong>Cấp độ:</strong> {goal?.jlpt_level}</span>
                <span><strong>Ngày:</strong> {formatDate(dayDetail.date)}</span>
                <span><strong>Tiến độ:</strong> {dayDetail.learned_words || 0} / {dayDetail.total_words} từ</span>
              </div>

              {/* 3 NÚT HỌC ĐIỀU HƯỚNG MỚI */}
              <div className={styles.studyActions}>
                <button className={`${styles.actionBtn} ${styles.flashcardBtn}`} onClick={() => handleNavigate("flashcard")}>
                  Flashcard
                </button>
                <button className={`${styles.actionBtn} ${styles.quizBtn}`} onClick={() => handleNavigate("multiple_choice")}>
                  Trắc nghiệm
                </button>
                <button className={`${styles.actionBtn} ${styles.typingBtn}`} onClick={() => handleNavigate("typing")}>
                  Tự luận
                </button>
              </div>
            </div>

            <div className={styles.progressCircleWrapper}>
              <svg width="84" height="84" className={styles.circularSvg}>
                <circle cx="42" cy="42" r={radius} className={styles.bgCircle} />
                <circle cx="42" cy="42" r={radius} className={styles.progressCircle} style={{ strokeDasharray: circumference, strokeDashoffset: offset, stroke: strokeColor }} />
              </svg>
              <div className={styles.progressText} style={{ color: strokeColor }}>{progress}%</div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Danh sách từ vựng</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th><th>Từ vựng</th><th>Cách đọc</th><th>Âm hán</th><th>Nghĩa tiếng Việt</th><th>JLPT</th>
                </tr>
              </thead>
              <tbody>
                {words.map((word) => (
                  <tr key={word.vocabulary_id} className={styles.tableRow}>
                    <td className={styles.idCol}>{word.vocabulary_id}</td>
                    <td className={styles.vocabWord}>{word.word}</td>
                    <td>{word.reading}</td>
                    <td>{word.kanji_meaning || "-"}</td>
                    <td className={styles.vocabMeaning}>{word.vietnamese_meaning}</td>
                    <td><span className={`${styles.badge} ${styles[word.jlpt_level]}`}>{word.jlpt_level}</span></td>
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