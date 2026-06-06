import { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { getQuizQuestionsApi } from "../../../api/quizApi";

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);

  const [score, setScore] = useState(0);

  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const res = await getQuizQuestionsApi();

      setQuestions(res.data.data || res.data);
    } catch (error) {
      alert("Không thể tải câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      alert("Hãy nhập đáp án");
      return;
    }

    const isCorrect =
      selectedAnswer.trim().toLowerCase() ===
      currentQuestion.correct_answer.trim().toLowerCase();

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      setShowResult(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setSelectedAnswer("");
  };

  return (
    <MainLayout>
      <h1>Luyện tập Quiz</h1>

      {loading && <p>Đang tải câu hỏi...</p>}

      {!loading && questions.length === 0 && (
        <p>Chưa có câu hỏi nào.</p>
      )}

      {!loading && showResult && (
        <div>
          <h2>Hoàn thành Quiz</h2>

          <p>
            Điểm số: {score} / {questions.length}
          </p>
        </div>
      )}

      {!loading && currentQuestion && !showResult && (
        <div>
          <p>
            Câu {currentIndex + 1} / {questions.length}
          </p>

          <h2>{currentQuestion.content}</h2>

          <input
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder="Nhập đáp án..."
          />

          <div style={{ marginTop: "20px" }}>
            <button onClick={handleSubmitAnswer}>
              Trả lời
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default QuizPage;