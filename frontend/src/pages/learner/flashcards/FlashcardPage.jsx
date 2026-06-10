import { useEffect, useState } from "react";

import MainLayout from "../../../layouts/MainLayout";
import { getFlashcardVocabulariesApi } from "../../../api/vocabularyApi";
import { getAllLessonsApi } from "../../../api/lessonApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import styles from "./FlashcardPage.module.css";

function FlashcardPage() {
  const [vocabularies, setVocabularies] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setError("");

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

  const filteredVocabularies = vocabularies.filter((vocab) => {
    const matchLevel = selectedLevel ? vocab.jlpt_level === selectedLevel : true;

    const matchLesson = selectedLessonId
      ? vocab.lesson_id === Number(selectedLessonId)
      : true;

    return matchLevel && matchLesson;
  });

  const currentVocabulary = filteredVocabularies[currentIndex];

  const handleChangeLevel = (e) => {
    setSelectedLevel(e.target.value);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleChangeLesson = (e) => {
    setSelectedLessonId(e.target.value);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredVocabularies.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Flashcard</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage />}

      {!loading && !error && (
        <div className={styles.filterBox}>
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

            {lessons.map((lesson) => (
              <option key={lesson.lesson_id} value={lesson.lesson_id}>
                {lesson.lesson_name} - {lesson.jlpt_level}
              </option>
            ))}
          </select>
        </div>
      )}

      {!loading && !error && filteredVocabularies.length === 0 && (
        <p className={styles.message}>Không có từ vựng phù hợp.</p>
      )}

      {!loading && !error && currentVocabulary && (
        <>
          <p className={styles.progress}>
            {currentIndex + 1} / {filteredVocabularies.length}
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

                <p className={styles.example}>
                  {currentVocabulary.example_sentence || "Chưa có ví dụ"}
                </p>

                <span className={styles.hint}>Click để quay lại</span>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              className={styles.button}
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              Trước
            </button>

            <button
              className={styles.button}
              onClick={handleNext}
              disabled={currentIndex === filteredVocabularies.length - 1}
            >
              Tiếp theo
            </button>
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default FlashcardPage;