import { useEffect, useState } from "react";

import MainLayout from "../../../layouts/MainLayout";
import { getFlashcardVocabulariesApi } from "../../../api/vocabularyApi";
import { getAllLessonsApi } from "../../../api/lessonApi";
import { submitSrsReviewApi } from "../../../api/srsApi";
import { useLocation } from "react-router-dom";
import { getGoalDayDetailApi } from "../../../api/studyGoalApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import styles from "./FlashcardPage.module.css";

function FlashcardPage() {

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const goalId = searchParams.get("goalId");
  const day = searchParams.get("day");

  const isGoalDayMode = goalId && day;

  const [vocabularies, setVocabularies] = useState([]);
  const [flashcardVocabularies, setFlashcardVocabularies] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");

  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [reviewStats, setReviewStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const jlptOrder = {
    N5: 1,
    N4: 2,
    N3: 3,
    N2: 4,
    N1: 5,
  };

  const fetchData = async () => {
    try {
      setError("");

      if (isGoalDayMode) {
        const res = await getGoalDayDetailApi(goalId, day);
        const data = res.data.data || res.data;

        setVocabularies(data.words || []);
        setLessons([]);
        return;
      }

      const [vocabRes, lessonRes] = await Promise.all([
        getFlashcardVocabulariesApi(),
        getAllLessonsApi(),
      ]);

      setVocabularies(vocabRes.data.data || vocabRes.data);
      setLessons(lessonRes.data.data || lessonRes.data);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải flashcard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatLessonName = (lessonName) => {
    if (!lessonName) {
      return "";
    }

    return lessonName.replace("Minna no Nihongo - ", "");
  };

  const filteredLessons = lessons
    .filter((lesson) => {
      return selectedLevel ? lesson.jlpt_level === selectedLevel : true;
    })
    .sort((a, b) => {
      const levelCompare =
        jlptOrder[a.jlpt_level] - jlptOrder[b.jlpt_level];

      if (levelCompare !== 0) {
        return levelCompare;
      }

      return a.lesson_id - b.lesson_id;
    });

  const filteredVocabularies = vocabularies.filter((vocab) => {
    const matchLevel = selectedLevel ? vocab.jlpt_level === selectedLevel : true;

    const matchLesson = selectedLessonId
      ? vocab.lesson_id === Number(selectedLessonId)
      : true;

    return matchLevel && matchLesson;
  });

  const sortedVocabularies = [...filteredVocabularies].sort((a, b) => {
    const levelCompare = jlptOrder[a.jlpt_level] - jlptOrder[b.jlpt_level];

    if (levelCompare !== 0) {
      return levelCompare;
    }

    const lessonCompare = a.lesson_id - b.lesson_id;

    if (lessonCompare !== 0) {
      return lessonCompare;
    }

    return a.vocabulary_id - b.vocabulary_id;
  });

  const currentVocabulary = flashcardVocabularies[currentIndex];

  const handleChangeLevel = (e) => {
    setSelectedLevel(e.target.value);
    setSelectedLessonId("");
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleChangeLesson = (e) => {
    setSelectedLessonId(e.target.value);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleStart = () => {
    if (sortedVocabularies.length === 0) {
      setError("Không có từ vựng phù hợp để học flashcard");
      return;
    }

    setError("");
    setFlashcardVocabularies(sortedVocabularies);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsStarted(true);
    setIsFinished(false);
    setReviewStats({
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    });
  };

  const handleBackToSelection = () => {
    setIsStarted(false);
    setIsFinished(false);
    setFlashcardVocabularies([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleFinish = () => {
    if (!window.confirm("Bạn có chắc muốn kết thúc phiên flashcard này không?")) {
      return;
    }

    setIsFinished(true);
  };

  const handleReview = async (rating) => {
    if (!currentVocabulary) {
      return;
    }

    const isCorrect = rating === "good" || rating === "easy";

    try {
      setError("");

      await submitSrsReviewApi({
        vocabulary_id: currentVocabulary.vocabulary_id,
        is_correct: isCorrect,
      });

      setReviewStats((prev) => ({
        ...prev,
        [rating]: prev[rating] + 1,
      }));

      if (currentIndex >= flashcardVocabularies.length - 1) {
        setIsFinished(true);
        return;
      }

      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể cập nhật tiến độ SRS"
      );
    }
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Flashcard</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !isStarted && !error && (
        <div className={styles.setupCard}>
          <h2>Chọn nội dung học flashcard</h2>

          {!isGoalDayMode && (
            <>
              <select
                className={styles.select}
                value={selectedLevel}
                onChange={handleChangeLevel}
              >
                <option value="">Tất cả cấp độ</option>
                <option value="N5">N5</option>
                <option value="N4">N4</option>
                <option value="N3">N3</option>
                <option value="N2">N2</option>
                <option value="N1">N1</option>
              </select>

              <select
                className={styles.select}
                value={selectedLessonId}
                onChange={handleChangeLesson}
              >
                <option value="">Tất cả bài học</option>

                {filteredLessons.map((lesson) => (
                  <option key={lesson.lesson_id} value={lesson.lesson_id}>
                    {formatLessonName(lesson.lesson_name)} - {lesson.jlpt_level}
                  </option>
                ))}
              </select>
            </>
          )}

          <p className={styles.message}>
            Có {sortedVocabularies.length} từ vựng trong phiên học này
          </p>

          <button className={styles.startButton} onClick={handleStart}>
            Bắt đầu học
          </button>
        </div>
      )}

      {!loading && isStarted && isFinished && (
        <div className={styles.resultCard}>
          <h2>Hoàn thành Flashcard</h2>

          <p>
            Tổng số từ đã học: <strong>{flashcardVocabularies.length}</strong>
          </p>

          <div className={styles.statsGrid}>
            <div>Lại: {reviewStats.again}</div>
            <div>Khó: {reviewStats.hard}</div>
            <div>Được: {reviewStats.good}</div>
            <div>Dễ: {reviewStats.easy}</div>
          </div>

          <button className={styles.startButton} onClick={handleBackToSelection}>
            Quay lại chọn bài
          </button>
        </div>
      )}

      {!loading && isStarted && !isFinished && currentVocabulary && (
        <>
          <p className={styles.progress}>
            {currentIndex + 1} / {flashcardVocabularies.length}
          </p>

          <div
            className={`${styles.card} ${isFlipped ? styles.flipped : ""}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {!isFlipped ? (
              <div className={styles.cardContent}>
                <h2 className={styles.word}>{currentVocabulary.word}</h2>

                <p className={styles.reading}>
                  {currentVocabulary.reading || "Chưa có cách đọc"}
                </p>

                <span className={styles.hint}>Click để xem nghĩa</span>
              </div>
            ) : (
              <div className={styles.cardContent}>
                <h2 className={styles.meaning}>
                  {currentVocabulary.vietnamese_meaning}
                </h2>

                <p className={styles.kanji}>
                  Âm Hán: {currentVocabulary.kanji_meaning || "-"}
                </p>

                <p className={styles.example}>
                  {currentVocabulary.example_sentence || "Chưa có ví dụ"}
                </p>

                <span className={styles.hint}>Click để quay lại</span>
              </div>
            )}
          </div>

          <div className={styles.reviewActions}>
            <button
              className={`${styles.reviewButton} ${styles.againButton}`}
              onClick={() => handleReview("again")}
            >
              Lại
            </button>

            <button
              className={`${styles.reviewButton} ${styles.hardButton}`}
              onClick={() => handleReview("hard")}
            >
              Khó
            </button>

            <button
              className={`${styles.reviewButton} ${styles.goodButton}`}
              onClick={() => handleReview("good")}
            >
              Được
            </button>

            <button
              className={`${styles.reviewButton} ${styles.easyButton}`}
              onClick={() => handleReview("easy")}
            >
              Dễ
            </button>
          </div>

          <button className={styles.finishButton} onClick={handleFinish}>
            Kết thúc phiên học
          </button>
        </>
      )}
    </MainLayout>
  );
}

export default FlashcardPage;