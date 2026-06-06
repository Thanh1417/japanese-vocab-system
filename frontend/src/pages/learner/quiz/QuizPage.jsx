import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import {
    getQuizQuestionsApi,
    startStudySessionApi,
    endStudySessionApi,
    createQuestionResultApi,
} from "../../../api/quizApi";
import styles from "./QuizPage.module.css";


function QuizPage() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sessionId, setSessionId] = useState(null);

    const fetchQuizData = async () => {
        try {
            const sessionRes = await startStudySessionApi();
            setSessionId(sessionRes.data.data.session_id);

            const questionRes = await getQuizQuestionsApi();
            setQuestions(questionRes.data.data || questionRes.data);
        } catch (error) {
            console.log(error);
            alert("Không thể tải dữ liệu quiz");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizData();
    }, []);

    const currentQuestion = questions[currentIndex];

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer.trim()) {
            alert("Hãy nhập đáp án");
            return;
        }

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
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Không thể lưu kết quả câu hỏi");
            return;
        }

        if (isCorrect) {
            setScore(newScore);
        }

        const nextIndex = currentIndex + 1;

        if (nextIndex >= questions.length) {
            if (sessionId) {
                await endStudySessionApi(sessionId, {
                    total_questions: questions.length,
                    correct_answers: newScore,
                });
            }

            setShowResult(true);
            return;
        }

        setCurrentIndex(nextIndex);
        setSelectedAnswer("");
    };

    return (
        <MainLayout>
            <h1 className={styles.title}>Luyện tập Quiz</h1>

            {loading && <p className={styles.message}>Đang tải câu hỏi...</p>}

            {!loading && questions.length === 0 && (
                <p className={styles.message}>Chưa có câu hỏi nào.</p>
            )}

            {!loading && showResult && (
                <div className={styles.resultCard}>
                    <h2>Hoàn thành Quiz</h2>

                    <p>
                        Điểm số: {score} / {questions.length}
                    </p>
                </div>
            )}

            {!loading && currentQuestion && !showResult && (
                <div className={styles.quizCard}>
                    <p className={styles.progress}>
                        Câu {currentIndex + 1} / {questions.length}
                    </p>

                    <h2 className={styles.question}>{currentQuestion.content}</h2>

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