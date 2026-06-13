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
    return new Date(date).toLocaleDateString();
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

  return (
    <MainLayout>
      <h1 className={styles.title}>Kế hoạch học ngày {dayNumber}</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && dayDetail && (
        <>
          <div className={styles.summaryCard}>
            <h2>{goal?.goal_name}</h2>

            <p>
              <strong>Cấp độ:</strong> {goal?.jlpt_level}
            </p>

            <p>
              <strong>Ngày học:</strong> {formatDate(dayDetail.date)}
            </p>

            <p>
              <strong>Số từ cần học:</strong> {dayDetail.total_words}
            </p>

            <div className={styles.studyActions}>
              <button onClick={goToFlashcard}>Học Flashcard</button>
              <button onClick={goToMultipleChoice}>Trắc nghiệm</button>
              <button onClick={goToTypingQuiz}>Tự luận</button>
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