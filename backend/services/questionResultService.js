const questionResultRepository = require("../repositories/questionResultRepository");
const questionRepository = require("../repositories/questionRepository");
const studySessionRepository = require("../repositories/studySessionRepository");
const srsService = require("./srsService");

const createQuestionResult = async (data) => {
  const session = await studySessionRepository.findStudySessionById(data.session_id);

  if (!session) {
    return { success: false, statusCode: 404, message: "Khong tim thay phien hoc!" };
  }

  // 1. LUỒNG CHO FLASHCARD (Frontend gửi xuống vocabulary_id)
  if (data.vocabulary_id) {
    const result = await questionResultRepository.createQuestionResult({
      session_id: Number(data.session_id),
      vocabulary_id: Number(data.vocabulary_id),
      is_correct: data.is_correct,
      rating: data.rating // Lưu đánh giá Khó/Dễ
    });
    return { success: true, statusCode: 201, message: "Lưu thẻ ghi nhớ thành công!", data: result };
  }

  // 2. LUỒNG CHO TRẮC NGHIỆM / TỰ LUẬN (Frontend gửi xuống question_id)
  if (!data.question_id) {
    return { success: false, statusCode: 400, message: "Thieu question_id hoac vocabulary_id!" };
  }

  const question = await questionRepository.findQuestionById(data.question_id);

  if (!question) {
    return { success: false, statusCode: 404, message: "Khong tim thay cau hoi!" };
  }

  const safeUserAnswer = data.user_answer ? data.user_answer.trim().toLowerCase() : "";
  const isCorrect = safeUserAnswer === question.correct_answer.trim().toLowerCase();

  const result = await questionResultRepository.createQuestionResult({
    session_id: Number(data.session_id),
    question_id: Number(data.question_id),
    user_answer: data.user_answer,
    is_correct: isCorrect,
    rating: data.rating // Nhận thêm rating từ Frontend truyền xuống
  });

  return { success: true, statusCode: 201, message: "Lưu câu hỏi thành công!", data: result };
};

const getResultsBySessionId = async (session_id) => {
  const session = await studySessionRepository.findStudySessionById(session_id);

  if (!session) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay phien hoc!",
    };
  }

  const results = await questionResultRepository.findResultsBySessionId(
    session_id
  );

  return {
    success: true,
    statusCode: 200,
    message: "Lay ket qua theo phien hoc thanh cong!",
    data: results,
  };
};

module.exports = {
  createQuestionResult,
  getResultsBySessionId,
};