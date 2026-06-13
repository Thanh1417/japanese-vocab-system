import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import MainLayout from "../../../layouts/MainLayout";

import {
  getQuizQuestionsApi,
  startStudySessionApi,
  endStudySessionApi,
  createQuestionResultApi,
} from "../../../api/quizApi";

import { getAllLessonsApi } from "../../../api/lessonApi";
import { getGoalDayDetailApi } from "../../../api/studyGoalApi";
import { getRecommendationsApi } from "../../../api/recommendationApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";

import styles from "./QuizPage.module.css";

function QuizPage() {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const goalId = searchParams.get("goalId");
  const day = searchParams.get("day");
  const mode = searchParams.get("mode");
  const source = searchParams.get("source");
  const isRecommendationMode = source === "recommendation";

  const isGoalDayMode = goalId && day;

  const [questions, setQuestions] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [currentOptions, setCurrentOptions] = useState([]);

  const [answerResult, setAnswerResult] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sessionId, setSessionId] = useState(null);

  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [quizMode, setQuizMode] = useState(mode || "typing");

  const [isStarted, setIsStarted] = useState(false);

  const sessionIdRef = useRef(null);
  const currentIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const showResultRef = useRef(false);

  const jlptOrder = {
    N5: 1,
    N4: 2,
    N3: 3,
    N2: 4,
    N1: 5,
  };

  const fetchQuizData = async () => {
    try {
      setError("");

      const questionRes = await getQuizQuestionsApi();
      const allQuestions = questionRes.data.data || questionRes.data;

      if (isRecommendationMode) {
        const recommendationRes = await getRecommendationsApi();
        const recommendationData = recommendationRes.data.data || recommendationRes.data;

        const recommendationVocabularyIds = recommendationData.map(
          (item) => item.vocabulary_id
        );

        const recommendationQuestions = allQuestions.filter((question) =>
          recommendationVocabularyIds.includes(question.vocabulary_id)
        );

        setQuestions(recommendationQuestions);
        setLessons([]);

        return;
      }

      if (isGoalDayMode) {
        const dayRes = await getGoalDayDetailApi(goalId, day);
        const dayData = dayRes.data.data || dayRes.data;
        const dayWords = dayData.words || [];

        const dayVocabularyIds = dayWords.map((word) => word.vocabulary_id);

        const dayQuestions = allQuestions.filter((question) =>
          dayVocabularyIds.includes(question.vocabulary_id)
        );

        setQuestions(dayQuestions);
        setLessons([]);

        return;
      }

      const lessonRes = await getAllLessonsApi();

      setQuestions(allQuestions);
      setLessons(lessonRes.data.data || lessonRes.data);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải dữ liệu quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [goalId, day]);

  useEffect(() => {
    if (mode) {
      setQuizMode(mode);
    }
  }, [mode]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    showResultRef.current = showResult;
  }, [showResult]);

  useEffect(() => {
    return () => {
      if (sessionIdRef.current && !showResultRef.current) {
        endStudySessionApi(sessionIdRef.current, {
          total_questions: currentIndexRef.current,
          correct_answers: scoreRef.current,
        });
      }
    };
  }, []);

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[.,;:()[\]{}]/g, "")
      .replace(/[，。、「」『』？！]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

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
      const levelCompare = jlptOrder[a.jlpt_level] - jlptOrder[b.jlpt_level];

      if (levelCompare !== 0) {
        return levelCompare;
      }

      return a.lesson_id - b.lesson_id;
    });

  const filteredQuestions = questions.filter((question) => {
    const matchLevel = selectedLevel
      ? question.vocabulary?.jlpt_level === selectedLevel
      : true;

    const matchLesson = selectedLessonId
      ? question.vocabulary?.lesson_id === Number(selectedLessonId)
      : true;

    return matchLevel && matchLesson;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    const levelCompare =
      jlptOrder[a.vocabulary?.jlpt_level] -
      jlptOrder[b.vocabulary?.jlpt_level];

    if (levelCompare !== 0) {
      return levelCompare;
    }

    const lessonCompare = a.vocabulary?.lesson_id - b.vocabulary?.lesson_id;

    if (lessonCompare !== 0) {
      return lessonCompare;
    }

    return a.question_id - b.question_id;
  });

  const currentQuestion = quizQuestions[currentIndex];

  const generateOptions = (question) => {
    if (!question) {
      return [];
    }

    const correctAnswer = question.correct_answer;

    const wrongAnswers = questions
      .filter((item) => {
        return (
          item.question_id !== question.question_id &&
          item.correct_answer &&
          normalizeText(item.correct_answer) !== normalizeText(correctAnswer)
        );
      })
      .map((item) => item.correct_answer);

    const uniqueWrongAnswers = [...new Set(wrongAnswers)];

    const shuffledWrongAnswers = uniqueWrongAnswers.sort(
      () => Math.random() - 0.5
    );

    const options = [correctAnswer, ...shuffledWrongAnswers.slice(0, 3)];

    return options.sort(() => Math.random() - 0.5);
  };

  const handleChangeLevel = (e) => {
    setSelectedLevel(e.target.value);
    setSelectedLessonId("");
  };

  const handleStartQuiz = async () => {
    if (sortedQuestions.length === 0) {
      setError("Chưa có câu hỏi cho lựa chọn này");
      return;
    }

    try {
      setError("");

      const sessionRes = await startStudySessionApi();

      setSessionId(sessionRes.data.data.session_id);

      setQuizQuestions(sortedQuestions);
      setCurrentOptions(generateOptions(sortedQuestions[0]));

      setCurrentIndex(0);
      setSelectedAnswer("");
      setAnswerResult(null);
      setHasAnswered(false);
      setScore(0);
      setShowResult(false);
      setIsStarted(true);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể bắt đầu phiên học");
    }
  };

  const checkAnswer = (answer) => {
    return (
      normalizeText(answer) === normalizeText(currentQuestion.correct_answer)
    );
  };

  const saveAnswer = async (answer, isCorrect) => {
    const newScore = isCorrect ? score + 1 : score;

    await createQuestionResultApi({
      session_id: sessionId,
      question_id: currentQuestion.question_id,
      user_answer: answer,
    });

    if (isCorrect) {
      setScore(newScore);
    }

    setAnswerResult(isCorrect);
    setHasAnswered(true);
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

    try {
      setError("");

      const isCorrect = checkAnswer(selectedAnswer);

      await saveAnswer(selectedAnswer, isCorrect);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể lưu kết quả câu hỏi"
      );
    }
  };

  const handleSelectOption = async (option) => {
    if (hasAnswered) {
      return;
    }

    if (!currentQuestion) {
      setError("Không tìm thấy câu hỏi hiện tại");
      return;
    }

    try {
      setError("");

      setSelectedAnswer(option);

      const isCorrect = checkAnswer(option);

      await saveAnswer(option, isCorrect);
    } catch (error) {
      setError(
        error.response?.data?.message || "Không thể lưu kết quả câu hỏi"
      );
    }
  };

  const handleNextQuestion = async () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= quizQuestions.length) {
      if (sessionId) {
        await endStudySessionApi(sessionId, {
          total_questions: quizQuestions.length,
          correct_answers: score,
        });
      }

      setShowResult(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setCurrentOptions(generateOptions(quizQuestions[nextIndex]));
    setSelectedAnswer("");
    setAnswerResult(null);
    setHasAnswered(false);
    setError("");
  };

  const handleFinishQuiz = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn kết thúc bài quiz hiện tại không?"
      )
    ) {
      return;
    }

    if (sessionId) {
      await endStudySessionApi(sessionId, {
        total_questions: hasAnswered ? currentIndex + 1 : currentIndex,
        correct_answers: score,
      });
    }

    setShowResult(true);
  };

  const handleBackToSelection = () => {
    setIsStarted(false);
    setShowResult(false);
    setQuizQuestions([]);
    setCurrentOptions([]);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setAnswerResult(null);
    setHasAnswered(false);
    setSessionId(null);
  };

  const getOptionClassName = (option) => {
    if (!hasAnswered) {
      return styles.optionButton;
    }

    const isCorrectOption =
      normalizeText(option) === normalizeText(currentQuestion.correct_answer);

    const isSelectedOption =
      normalizeText(option) === normalizeText(selectedAnswer);

    if (isCorrectOption) {
      return `${styles.optionButton} ${styles.correctOption}`;
    }

    if (isSelectedOption && !isCorrectOption) {
      return `${styles.optionButton} ${styles.wrongOption}`;
    }

    return styles.optionButton;
  };

  return (
    <MainLayout>
      <h1 className={styles.title}>Luyện tập Quiz</h1>

      <ErrorMessage message={error} />

      {loading && <LoadingMessage text="Đang tải câu hỏi..." />}

      {!loading && !isStarted && !error && (
        <div className={styles.quizCard}>
          <h2>
            {isGoalDayMode
              ? `Luyện tập ngày ${day}`
              : isRecommendationMode
                ? "Luyện tập theo gợi ý"
                : "Chọn nội dung luyện tập"}
          </h2>

          <select
            className={styles.input}
            value={quizMode}
            onChange={(e) => setQuizMode(e.target.value)}
            disabled={isGoalDayMode}
          >
            <option value="typing">Tự luận</option>
            <option value="multiple_choice">Trắc nghiệm</option>
          </select>

          {!isGoalDayMode && !isRecommendationMode && (
            <>
              <select
                className={styles.input}
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
                className={styles.input}
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
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
            Có {sortedQuestions.length} câu hỏi trong phiên học này.
          </p>

          <div className={styles.actions}>
            <button className={styles.submitButton} onClick={handleStartQuiz}>
              Bắt đầu luyện tập
            </button>
          </div>
        </div>
      )}

      {!loading && isStarted && quizQuestions.length === 0 && (
        <p className={styles.message}>Chưa có câu hỏi cho nội dung này</p>
      )}

      {!loading && showResult && (
        <div className={styles.resultCard}>
          <h2>Hoàn thành Quiz</h2>

          <p>
            Điểm số: {score} / {quizQuestions.length}
          </p>

          <button
            className={styles.submitButton}
            type="button"
            onClick={handleBackToSelection}
          >
            Quay lại chọn bài
          </button>
        </div>
      )}

      {!loading && isStarted && currentQuestion && !showResult && (
        <div className={styles.quizCard}>
          <p className={styles.progress}>
            Câu {currentIndex + 1} / {quizQuestions.length}
          </p>

          <h2 className={styles.question}>{currentQuestion.content}</h2>

          {quizMode === "typing" && (
            <input
              className={styles.input}
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Nhập đáp án..."
              disabled={hasAnswered}
            />
          )}

          {quizMode === "multiple_choice" && (
            <div className={styles.optionGrid}>
              {currentOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={getOptionClassName(option)}
                  onClick={() => handleSelectOption(option)}
                  disabled={hasAnswered}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {answerResult === true && (
            <p className={styles.correct}>✅ Chính xác</p>
          )}

          {answerResult === false && quizMode === "typing" && (
            <p className={styles.wrong}>
              ❌ Sai. Đáp án đúng: {currentQuestion.correct_answer}
            </p>
          )}

          <div className={styles.actions}>
            {quizMode === "typing" && !hasAnswered && (
              <button
                className={styles.submitButton}
                onClick={handleSubmitAnswer}
              >
                Trả lời
              </button>
            )}

            {hasAnswered && (
              <button
                className={styles.submitButton}
                onClick={handleNextQuestion}
              >
                Câu tiếp theo
              </button>
            )}

            <button
              className={styles.cancelButton}
              type="button"
              onClick={handleFinishQuiz}
            >
              Kết thúc
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default QuizPage;