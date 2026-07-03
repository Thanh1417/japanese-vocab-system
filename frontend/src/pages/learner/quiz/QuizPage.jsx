import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MainLayout from "../../../layouts/MainLayout";

import {
  getQuizQuestionsApi,
  startStudySessionApi,
  endStudySessionApi,
  createQuestionResultApi,
} from "../../../api/quizApi";

import { getFlashcardVocabulariesApi } from "../../../api/vocabularyApi";
import { submitSrsReviewApi } from "../../../api/srsApi";

import { getAllLessonsApi } from "../../../api/lessonApi";
import { getGoalDayDetailApi } from "../../../api/studyGoalApi";
import { getRecommendationsApi } from "../../../api/recommendationApi";

import LoadingMessage from "../../../components/common/LoadingMessage";
import ErrorMessage from "../../../components/common/ErrorMessage";
import ConfirmModal from "../../../components/common/ConfirmModal";
import Toast from "../../../components/common/Toast";

import styles from "./QuizPage.module.css";

function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const goalId = searchParams.get("goalId");
  const day = searchParams.get("day");
  const mode = searchParams.get("mode");
  const source = searchParams.get("source");

  const isGoalDayMode = goalId && day;
  const isRecommendationMode = source === "recommendation";

  // Data States
  const [questions, setQuestions] = useState([]);
  const [vocabularies, setVocabularies] = useState([]);
  const [lessons, setLessons] = useState([]);

  // Active Session States
  const [quizMode, setQuizMode] = useState(mode || "flashcard");
  const [studyList, setStudyList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Flashcard specific states
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewStats, setReviewStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const [animatingClass, setAnimatingClass] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Quiz specific states
  const [sessionId, setSessionId] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [currentOptions, setCurrentOptions] = useState([]);
  const [answerResult, setAnswerResult] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  //Đặt giờ
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Filter States
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  // Popup xác nhận (thay window.confirm)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", variant: "danger", onConfirm: null });

  // Toast thông báo (thay alert)
  const [toast, setToast] = useState({ isOpen: false, message: "", variant: "info" });

  const showToast = (message, variant = "info") => setToast({ isOpen: true, message, variant });
  const closeToast = () => setToast((prev) => ({ ...prev, isOpen: false }));

  const openConfirm = (title, message, onConfirm, variant = "warning") =>
    setConfirmModal({ isOpen: true, title, message, variant, onConfirm });
  const closeConfirm = () => setConfirmModal((prev) => ({ ...prev, isOpen: false, onConfirm: null }));

  const sessionIdRef = useRef(null);
  const currentIndexRef = useRef(0);
  const scoreRef = useRef(0);
  const showResultRef = useRef(false);

  const jlptOrder = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };

  const fetchAllData = async () => {
    try {
      setError("");
      setLoading(true);

      const [questionRes, vocabRes, lessonRes] = await Promise.all([
        getQuizQuestionsApi(),
        getFlashcardVocabulariesApi(),
        getAllLessonsApi()
      ]);

      let allQuestions = questionRes.data.data || questionRes.data;
      let allVocabs = vocabRes.data.data || vocabRes.data;

      if (isRecommendationMode) {
        const recommendationRes = await getRecommendationsApi();
        const recData = recommendationRes.data.data || recommendationRes.data;
        const recVocabIds = recData.map(item => item.vocabulary_id);

        allVocabs = recData;
        allQuestions = allQuestions.filter(q => recVocabIds.includes(q.vocabulary_id));
        setLessons([]);
      }
      else if (isGoalDayMode) {
        const dayRes = await getGoalDayDetailApi(goalId, day);
        const dayData = dayRes.data.data || dayRes.data;
        const dayWords = dayData.words || [];
        const dayVocabIds = dayWords.map(word => word.vocabulary_id);

        allVocabs = dayWords;
        allQuestions = allQuestions.filter(q => dayVocabIds.includes(q.vocabulary_id));
        setLessons([]);
      }
      else {
        setLessons(lessonRes.data.data || lessonRes.data);
      }

      setQuestions(allQuestions);
      setVocabularies(allVocabs);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải dữ liệu học tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, [goalId, day]);
  useEffect(() => { if (mode) setQuizMode(mode); }, [mode]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
    currentIndexRef.current = currentIndex;
    scoreRef.current = score;
    showResultRef.current = showResult;
  }, [sessionId, currentIndex, score, showResult]);

  // LUÔN LƯU LẠI PHIÊN HỌC KHI THOÁT NGANG CHO CẢ 3 LOẠI
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

  // Nhấn ENTER để tiếp tục
  useEffect(() => {
    const handleGlobalEnter = (e) => {
      // Chỉ hoạt động khi đang làm Quiz (Trắc nghiệm/Tự luận) và ĐÃ trả lời xong
      if (e.key === "Enter" && isStarted && !showResult && quizMode !== "flashcard") {
        if (hasAnswered) {
          e.preventDefault(); // Tránh lỗi cuộn trang
          handleNextItem();   // Tự động nhảy sang câu tiếp theo
        }
      }
    };

    window.addEventListener("keydown", handleGlobalEnter);
    return () => window.removeEventListener("keydown", handleGlobalEnter);
  }, [isStarted, showResult, quizMode, hasAnswered, currentIndex, studyList, sessionId, score]);

  const formatLessonName = (lessonName) => lessonName ? lessonName.replace("Minna no Nihongo - ", "") : "";

  const filteredLessons = lessons
    .filter(lesson => selectedLevel ? lesson.jlpt_level === selectedLevel : true)
    .sort((a, b) => (jlptOrder[a.jlpt_level] - jlptOrder[b.jlpt_level]) || (a.lesson_id - b.lesson_id));

  const getFilteredStudyList = () => {
    if (quizMode === "flashcard") {
      return vocabularies.filter(vocab => {
        const matchLevel = selectedLevel ? vocab.jlpt_level === selectedLevel : true;
        const matchLesson = selectedLessonId ? vocab.lesson_id === Number(selectedLessonId) : true;
        return matchLevel && matchLesson;
      }).sort((a, b) => a.vocabulary_id - b.vocabulary_id);
    } else {
      return questions.filter(question => {
        const matchLevel = selectedLevel ? question.vocabulary?.jlpt_level === selectedLevel : true;
        const matchLesson = selectedLessonId ? question.vocabulary?.lesson_id === Number(selectedLessonId) : true;
        const matchType = question.question_type === quizMode;
        return matchLevel && matchLesson && matchType;
      }).sort((a, b) => a.question_id - b.question_id);
    }
  };

  const currentStudyList = getFilteredStudyList();
  const currentItem = studyList[currentIndex];

  const generateOptions = (question) => {
    if (!question || question.question_type !== 'multiple_choice' || !Array.isArray(question.options)) return [];
    return [...question.options].sort(() => Math.random() - 0.5);
  };

  const handleStartStudy = async () => {
    if (currentStudyList.length === 0) {
      setError(`Chưa có dữ liệu cho nội dung này. Vui lòng chọn bài khác!`);
      return;
    }

    try {
      setError("");
      const sessionRes = await startStudySessionApi({ session_type: quizMode });
      setSessionId(sessionRes.data.data.session_id);

      setStudyList(currentStudyList);
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setIsStarted(true);

      if (quizMode === "flashcard") {
        setIsFlipped(false);
        setReviewStats({ again: 0, hard: 0, good: 0, easy: 0 });
      } else {
        setCurrentOptions(generateOptions(currentStudyList[0]));
        setSelectedAnswer("");
        setAnswerResult(null);
        setHasAnswered(false);
        setQuestionStartTime(Date.now());
      }
    } catch (err) {
      setError("Không thể bắt đầu phiên học");
      setIsStarted(false);
    }
  };

  useEffect(() => {
    if (!loading && !isStarted && !hasAutoStarted && (isRecommendationMode || isGoalDayMode)) {
      if (currentStudyList.length > 0) {
        setHasAutoStarted(true);
        handleStartStudy();
      } else if (vocabularies.length === 0 && questions.length === 0 && !error) {
        setHasAutoStarted(true);
        setError("Không tìm thấy nội dung học phù hợp.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isStarted, hasAutoStarted, isRecommendationMode, isGoalDayMode, currentStudyList.length]);

  const handleReviewSrs = async (rating) => {
    if (!currentItem || isAnimating) return;
    setIsAnimating(true);

    const isCorrect = rating === "good" || rating === "easy";
    if (isCorrect) setScore(prev => prev + 1);

    setAnimatingClass(styles.swipeOut);
    submitSrsReviewApi({ vocabulary_id: currentItem.vocabulary_id, is_correct: isCorrect })
      .catch((err) => console.log("Lỗi cập nhật tiến độ", err));

    setReviewStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));

    setTimeout(async () => {
      if (currentIndex >= studyList.length - 1) {
        if (sessionId) {
          await endStudySessionApi(sessionId, {
            total_questions: studyList.length,
            correct_answers: score + (isCorrect ? 1 : 0),
          });
        }
        setShowResult(true);
        setIsAnimating(false);
        return;
      }

      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
      setAnimatingClass(styles.swipeIn);

      setTimeout(() => {
        setAnimatingClass("");
        setIsAnimating(false);
      }, 300);

    }, 300);
  };

  const playAudio = (text) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoices = voices.filter(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');
      if (japaneseVoices.length > 0) {
        utterance.voice = japaneseVoices.find(v => v.name.includes('Google') || v.name.includes('Kyoko') || v.name.includes('Haruka')) || japaneseVoices[0];
      }
      window.speechSynthesis.speak(utterance);
    } else {
      showToast("Trình duyệt không hỗ trợ phát âm.", "warning");
    }
  };

  // ==========================================
  // THUẬT TOÁN XỬ LÝ CHUỖI ĐÁP ÁN MỚI
  // ==========================================

  // Hàm làm sạch chuỗi: Bỏ ngoặc, bỏ khoảng trắng và các dấu câu thừa
  const cleanText = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      // 1. Xóa toàn bộ nội dung nằm trong () [] 「」
      .replace(/\(.*?\)|\[.*?\]|「.*?」/g, "")
      // 2. Xóa toàn bộ khoảng trắng và ký tự đặc biệt thừa
      .replace(/[\s~～\-:;"'！？?!。、，]/g, "")
      .trim();
  };

  const checkAnswer = (userAnswer) => {
    if (!currentItem || !currentItem.correct_answer) return false;

    const normalizedUser = cleanText(userAnswer);

    // Tách đáp án đúng từ DB thành mảng các đáp án hợp lệ (cắt theo dấu phẩy, gạch chéo, chấm phẩy)
    let validAnswers = currentItem.correct_answer
      .split(/[,/;]/)
      .map(ans => cleanText(ans))
      .filter(ans => ans !== ""); // Bỏ các option bị rỗng sau khi làm sạch

    // Fallback: Chống kẹt nếu toàn bộ đáp án DB nằm trong ngoặc (VD: "[カセット]" -> rỗng)
    if (validAnswers.length === 0) {
      validAnswers = currentItem.correct_answer
        .split(/[,/;]/)
        .map(ans => ans.toLowerCase().replace(/[\s~～\-:;"'！？?!。、，]/g, "")) // Chỉ bỏ khoảng trắng
        .filter(ans => ans !== "");
    }

    // Nếu câu trả lời của user khớp với BẤT KỲ lựa chọn hợp lệ nào -> Đúng!
    return validAnswers.includes(normalizedUser);
  };

  //SRS
  const saveAnswer = async (answer, isCorrect) => {
    const timeTaken = (Date.now() - questionStartTime) / 1000;

    let rating = "again";

    if (isCorrect) {
      if (quizMode === "multiple_choice") {
        if (timeTaken <= 3) rating = "easy";
        else if (timeTaken <= 8) rating = "good";
        else rating = "hard";
      } else if (quizMode === "typing") {
        if (timeTaken <= 6) rating = "easy";
        else if (timeTaken <= 15) rating = "good";
        else rating = "hard";
      }
    }

    await createQuestionResultApi({
      session_id: sessionId,
      question_id: currentItem.question_id,
      user_answer: answer,
    });

    if (isCorrect) setScore(score + 1);
    setAnswerResult(isCorrect);
    setHasAnswered(true);

    submitSrsReviewApi({
      vocabulary_id: currentItem.vocabulary_id,
      rating: rating,
      session_id: sessionId
    }).catch((err) => console.log("Lỗi cập nhật tiến độ SRS", err));
  };

  const handleSubmitQuizAnswer = async () => {
    if (!selectedAnswer.trim()) return setError("Hãy nhập đáp án");
    setError("");
    await saveAnswer(selectedAnswer, checkAnswer(selectedAnswer));
  };

  const handleSelectOption = async (option) => {
    if (hasAnswered) return;
    setError("");
    setSelectedAnswer(option);
    
    // So sánh trực tiếp chuỗi gốc thay vì dùng hàm checkAnswer cắt gọt
    const isCorrect = option.trim() === currentItem.correct_answer.trim();
    
    await saveAnswer(option, isCorrect);
  };

  const handleNextItem = async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= studyList.length) {
      if (sessionId) {
        await endStudySessionApi(sessionId, { total_questions: studyList.length, correct_answers: score });
      }
      setShowResult(true);
      return;
    }
    setCurrentIndex(nextIndex);
    if (quizMode !== "flashcard") {
      setCurrentOptions(generateOptions(studyList[nextIndex]));
      setSelectedAnswer("");
      setAnswerResult(null);
      setHasAnswered(false);
      setQuestionStartTime(Date.now());
    }
  };

  const handleBackToSetup = () => {
    setIsStarted(false);
    setShowResult(false);
    setStudyList([]);
    setSessionId(null);
    setHasAutoStarted(false);

    if (isRecommendationMode) {
      navigate("/recommendations");
    } else if (isGoalDayMode) {
      navigate(-1);
    }
  };

  const handleFinishEarly = () => {
    openConfirm(
      "Kết thúc bài học",
      "Bạn có chắc chắn muốn kết thúc bài học không? Tiến độ hiện tại sẽ được lưu lại.",
      async () => {
        closeConfirm();
        if (sessionId) {
          await endStudySessionApi(sessionId, {
            total_questions: quizMode === 'flashcard' || !hasAnswered ? currentIndex : currentIndex + 1,
            correct_answers: score,
          });
        }
        setShowResult(true);
      },
      "warning"
    );
  };

  // Nâng cấp: Tô màu chính xác dựa trên hàm checkAnswer
  const getOptionClassName = (option) => {
    if (!hasAnswered) return styles.optionButton;

    // So sánh trực tiếp chuỗi gốc (chỉ loại bỏ khoảng trắng thừa 2 đầu)
    const isCorrectOption = option.trim() === currentItem.correct_answer.trim();
    const isSelectedOption = option.trim() === selectedAnswer.trim();

    if (isCorrectOption) {
      return `${styles.optionButton} ${styles.correctOption}`; // Luôn bôi xanh đáp án đúng
    }
    if (isSelectedOption && !isCorrectOption) {
      return `${styles.optionButton} ${styles.wrongOption}`; // Bôi đỏ nếu chọn sai
    }

    return styles.optionButton;
  };

  const showSetupCard = !isGoalDayMode && !isRecommendationMode;

  return (
    <>
    <MainLayout>
      <div className={styles.headerArea}>
        <h1 className={styles.title}>Học từ vựng và luyện tập</h1>
      </div>

      <ErrorMessage message={error} />

      {(loading || (!isStarted && !showSetupCard && !error)) && (
        <LoadingMessage text="Đang chuẩn bị bài học..." />
      )}

      {!loading && !isStarted && !showResult && !error && showSetupCard && (
        <div className={styles.quizSetupCard}>
          <h2 className={styles.setupTitle}>Lựa chọn bài học</h2>

          <div className={styles.setupForm}>
            <div className={styles.formGroup}>
              <label>Phương pháp học</label>
              <select className={styles.input} value={quizMode} onChange={(e) => setQuizMode(e.target.value)}>
                <option value="flashcard">Flashcard</option>
                <option value="multiple_choice">Trắc nghiệm</option>
                <option value="typing">Tự luận</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Cấp độ JLPT</label>
              <select className={styles.input} value={selectedLevel} onChange={(e) => { setSelectedLevel(e.target.value); setSelectedLessonId(""); }}>
                <option value="">Tất cả cấp độ</option>
                <option value="N5">N5</option>
                <option value="N4">N4</option>
                <option value="N3">N3</option>
                <option value="N2">N2</option>
                <option value="N1">N1</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Bài học</label>
              <select className={styles.input} value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)}>
                <option value="">Tất cả bài học</option>
                {filteredLessons.map(lesson => (
                  <option key={lesson.lesson_id} value={lesson.lesson_id}>
                    {formatLessonName(lesson.lesson_name)} - {lesson.jlpt_level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.setupFooter}>
            <p className={styles.message}>Tìm thấy <strong style={{ color: "#3b82f6" }}>{currentStudyList.length}</strong> từ vựng / câu hỏi</p>
            <button className={styles.startBtn} onClick={handleStartStudy}>Bắt đầu học</button>
          </div>
        </div>
      )}

      {!loading && showResult && (
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>🏆</div>
          <h2 className={styles.resultTitle}>Hoàn thành!</h2>
          <p className={styles.resultScore}>
            {quizMode === 'flashcard' ? (
              <>Tổng số thẻ đã lật: <span>{studyList.length}</span></>
            ) : (
              <>Điểm số: <span>{score}</span> / {studyList.length}</>
            )}
          </p>

          {quizMode === 'flashcard' && (
            <div className={styles.statsGrid}>
              <div className={styles.statAgain}>Lại: {reviewStats.again}</div>
              <div className={styles.statHard}>Khó: {reviewStats.hard}</div>
              <div className={styles.statGood}>Được: {reviewStats.good}</div>
              <div className={styles.statEasy}>Dễ: {reviewStats.easy}</div>
            </div>
          )}

          <button className={styles.startBtn} onClick={handleBackToSetup}>
            {isRecommendationMode || isGoalDayMode ? "Quay lại danh sách" : "Chọn bài khác"}
          </button>
        </div>
      )}

      {!loading && isStarted && !showResult && currentItem && (
        <div className={styles.quizActiveCard}>
          <div className={styles.quizHeader}>
            <span className={styles.progressText}>Tiến độ: {currentIndex + 1} / {studyList.length}</span>
            {quizMode !== 'flashcard' && <span className={styles.scoreText}>Điểm: {score}</span>}
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(currentIndex / studyList.length) * 100}%` }}></div>
          </div>

          {quizMode === "flashcard" && (
            <div className={styles.flashcardContainer}>
              <div className={`${styles.flashcardWrapper} ${animatingClass}`}>

                <div
                  className={`${styles.card} ${isFlipped ? styles.flipped : ""} ${isAnimating ? styles.instant : ""}`}
                  onClick={() => { if (!isAnimating) setIsFlipped(!isFlipped) }}
                >
                  <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    <h2 className={styles.wordText}>{currentItem.word}</h2>
                    <span className={styles.flipHint}>Click để lật thẻ</span>
                  </div>

                  <div className={`${styles.cardFace} ${styles.cardBack}`}>
                    <h2 className={styles.readingText}>{currentItem.reading || " "}</h2>
                    <h2 className={styles.meaningText}>{currentItem.vietnamese_meaning}</h2>
                    <p className={styles.kanjiText}>Âm Hán: {currentItem.kanji_meaning || "-"}</p>

                    <button
                      type="button"
                      className={styles.playAudioBtnFlashcard}
                      onClick={(e) => { e.stopPropagation(); playAudio(currentItem.reading || currentItem.word); }}
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <div className={`${styles.reviewActions} ${!isFlipped ? styles.hidden : ""}`}>
                  <button className={`${styles.reviewButton} ${styles.againButton}`} onClick={() => handleReviewSrs("again")}>Quên</button>
                  <button className={`${styles.reviewButton} ${styles.hardButton}`} onClick={() => handleReviewSrs("hard")}>Khó</button>
                  <button className={`${styles.reviewButton} ${styles.goodButton}`} onClick={() => handleReviewSrs("good")}>Được</button>
                  <button className={`${styles.reviewButton} ${styles.easyButton}`} onClick={() => handleReviewSrs("easy")}>Rất Dễ</button>
                </div>

                {!isFlipped && <button className={styles.showAnswerBtn} onClick={() => setIsFlipped(true)}>Xem đáp án</button>}
              </div>
            </div>
          )}

          {quizMode !== "flashcard" && (
            <>
              <div className={styles.questionBlock}>
                <p className={styles.questionLabel}>
                  {currentItem.content.replace(/：.*|:.*/, "").trim()}
                </p>
                <div className={styles.questionKanjiWrapper}>
                  {currentItem.vocabulary?.reading && (
                    <span className={styles.questionReading}>
                      {currentItem.vocabulary.reading}
                    </span>
                  )}
                  <span className={styles.questionKanji}>
                    {currentItem.content.replace(/.*[：:]\s*/, "").trim()}
                  </span>
                </div>
              </div>


              {quizMode === "typing" && (
                <div className={styles.typingArea}>
                  <input
                    className={styles.typingInput}
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Nhập đáp án của bạn vào đây..."
                    disabled={hasAnswered} autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter' && !hasAnswered) handleSubmitQuizAnswer(); }}
                  />
                </div>
              )}

              {quizMode === "multiple_choice" && (
                <div className={styles.optionGrid}>
                  {currentOptions.map((option, index) => (
                    <button key={index} className={getOptionClassName(option)} onClick={() => handleSelectOption(option)} disabled={hasAnswered}>
                      <span className={styles.optionLetter}>{String.fromCharCode(65 + index)}</span>
                      <span className={styles.optionText}>{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Chỉ hiển thị feedbackArea khi đang làm bài Tự luận (typing) */}
              {quizMode === "typing" && (
                <div className={styles.feedbackArea}>
                  {answerResult === true &&
                    <div className={styles.feedbackCorrect}>
                      Chính xác! Đáp án đúng là: <strong>{currentItem.correct_answer}</strong>
                    </div>
                  }
                  {answerResult === false && (
                    <div className={styles.feedbackWrong}>
                      Sai rồi! Đáp án đúng là: <strong>{currentItem.correct_answer}</strong>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.quizActions}>
                {quizMode === "typing" && !hasAnswered && (
                  <button className={styles.actionBtnPrimary} onClick={handleSubmitQuizAnswer}>Kiểm tra</button>
                )}
                {hasAnswered && <button className={styles.actionBtnNext} onClick={handleNextItem}>Tiếp tục ➔</button>}
              </div>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button className={styles.actionBtnCancel} onClick={handleFinishEarly}>Thoát phiên học</button>
          </div>
        </div>
      )}
    </MainLayout>

    <ConfirmModal
      isOpen={confirmModal.isOpen}
      title={confirmModal.title}
      message={confirmModal.message}
      variant={confirmModal.variant}
      confirmText="Xác nhận"
      cancelText="Huỷ"
      onConfirm={confirmModal.onConfirm}
      onCancel={closeConfirm}
    />

    <Toast
      isOpen={toast.isOpen}
      message={toast.message}
      variant={toast.variant}
      onClose={closeToast}
    />
  </>
  );
}

export default QuizPage;