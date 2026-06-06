const questionResultRepository = require("../repositories/questionResultRepository");
const questionRepository = require("../repositories/questionRepository");
const studySessionRepository = require("../repositories/studySessionRepository");
const srsService = require("./srsService");

const createQuestionResult = async (data) => {
  const session = await studySessionRepository.findStudySessionById(
    data.session_id
  );

  if (!session) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay phien hoc!",
    };
  }

  const question = await questionRepository.findQuestionById(data.question_id);

  if (!question) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay cau hoi!",
    };
  }

    const isCorrect = data.user_answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();

  const result = await questionResultRepository.createQuestionResult({
    session_id: Number(data.session_id),
    question_id: Number(data.question_id),
    user_answer: data.user_answer,
    is_correct: isCorrect,
  });

  await srsService.updateVocabularyProgress(
    session.account_id,
    question.vocabulary_id,
    isCorrect
  );

  return {
    success: true,
    statusCode: 201,
    message: "Luu ket qua cau hoi thanh cong!",
    data: result,
  };
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