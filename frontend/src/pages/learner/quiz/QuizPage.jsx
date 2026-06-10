import { useEffect, useState } from "react";

import MainLayout from "../../../layouts/MainLayout";

import {
  getQuizQuestionsApi,
  startStudySessionApi,
  endStudySessionApi,
  createQuestionResultApi,
} from "../../../api/quizApi";

import { getAllLessonsApi } from "../../../api/lessonApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import styles from "./QuizPage.module.css";

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sessionId, setSessionId] = useState(null);

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");

  const [isStarted, setIsStarted] = useState(false);

  const fetchQuizData = async () => {
    try {
      setError("");

      const [sessionRes, questionRes, lessonRes] = await Promise.all([
        startStudySessionApi(),
        getQuizQuestionsApi(),
        getAllLessonsApi(),
      ]);

      setSessionId(sessionRes.data.data.session_id);
      setQuestions(questionRes.data.data || questionRes.data);
      setLessons(lessonRes.data.data || lessonRes.data);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải dữ liệu quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const matchLevel = selectedLevel
      ? question.vocabulary?.jlpt_level === selectedLevel
      : true;

    const matchLesson = selectedLessonId
      ? question.vocabulary?.lesson_id === Number(selectedLessonId)
      : true;

    return matchLevel && matchLesson;
  });

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const currentQuestion = quizQuestions[currentIndex];

  const handleStartQuiz = () => {
    const shuffledQuestions = shuffleArray(filteredQuestions);

    setQuizQuestions(shuffledQuestions);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setShowResult(false);
    setError("");
    setIsStarted(true);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer.trim()) {
      setError("Hãy nhập đáp án");
      return;
    }

    if (!currentQuestion) {
      setError("Không tìm thấy câu hỏi hiện tại");
      return;
    }

    setError("");

    const isCorrect =
      selectedAnswer.trim().toLowerCase() ===
      currentQuestion.correct_answer.trim().toLowerCase();

    const newScore = isCorrect ? score + 1 : score;

    try {
      await createQuestionResultApi({
        session_id: sessionId,
        question_id: currentQuestion.question_id,
        user_answer: selectedAnswer,
      });

      if (isCorrect) {
        setScore(newScore);
      }

      const nextIndex = currentIndex + 1;

      if (nextIndex >= quizQuestions.length) {
        if (sessionId) {
          await endStudySessionApi(sessionId, {
            total_questions: quizQuestions.length,
            correct_answers: newScore,
          });
        }

        setShowResult(true);
        return;
      }

      setCurrentIndex(nextIndex);
      setSelectedAnswer("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể lưu kết quả câu hỏi"
      );
    }
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Luyện tập Quiz</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage text="Đang tải câu hỏi..." />}

      {!loading && !isStarted && !error && (
        <div className={styles.quizCard}>
          <h2>Chọn nội dung luyện tập</h2>

          <select
            className={styles.input}
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">Tất cả cấp độ</option>
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
            <option value="N2">N2</option>
            <option value="N1">N1</option>
          </select>

          <select
            className={styles.input}
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
          >
            <option value="">Tất cả bài học</option>

            {lessons.map((lesson) => (
              <option key={lesson.lesson_id} value={lesson.lesson_id}>
                {lesson.lesson_name} - {lesson.jlpt_level}
              </option>
            ))}
          </select>

          <div className={styles.actions}>
            <button className={styles.submitButton} onClick={handleStartQuiz}>
              Bắt đầu luyện tập
            </button>
          </div>
        </div>
      )}

      {!loading && isStarted && quizQuestions.length === 0 && (
        <p className={styles.message}>Chưa có câu hỏi cho cấp độ này</p>
      )}

      {!loading && showResult && (
        <div className={styles.resultCard}>
          <h2>Hoàn thành Quiz</h2>

          <p>
            Điểm số: {score} / {quizQuestions.length}
          </p>
        </div>
      )}

      {!loading && isStarted && currentQuestion && !showResult && (
        <div className={styles.quizCard}>
          <p className={styles.progress}>
            Câu {currentIndex + 1} / {quizQuestions.length}
          </p>

          <h2 className={styles.question}>{currentQuestion.content}</h2>

          {currentQuestion.vocabulary && (
            <p className={styles.message}>
              Từ vựng: {currentQuestion.vocabulary.word} -{" "}
              {currentQuestion.vocabulary.jlpt_level}
            </p>
          )}

          <input
            className={styles.input}
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder="Nhập đáp án..."
          />

          <div className={styles.actions}>
            <button
              className={styles.submitButton}
              onClick={handleSubmitAnswer}
            >
              Trả lời
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default QuizPage;