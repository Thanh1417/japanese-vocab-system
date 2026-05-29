const questionRepository = require("../repositories/questionRepository");

const getAllQuestions = async () => {
  const questions = await questionRepository.findAllQuestions();

  return {
    success: true,
    statusCode: 200,
    message: "Lay danh sach cau hoi thanh cong!",
    data: questions,
  };
};

const getQuestionById = async (question_id) => {
  const question = await questionRepository.findQuestionById(question_id);

  if (!question) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay cau hoi!",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: question,
  };
};

const getQuestionsByVocabularyId = async (vocabulary_id) => {
  const questions = await questionRepository.findQuestionsByVocabularyId(
    vocabulary_id
  );

  return {
    success: true,
    statusCode: 200,
    message: "Lay cau hoi theo tu vung thanh cong!",
    data: questions,
  };
};

const createQuestion = async (data) => {
  const newQuestion = await questionRepository.createQuestion(data);

  return {
    success: true,
    statusCode: 201,
    message: "Them cau hoi thanh cong!",
    data: newQuestion,
  };
};

const updateQuestion = async (question_id, data) => {
  const question = await questionRepository.findQuestionById(question_id);

  if (!question) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay cau hoi!",
    };
  }

  const updatedQuestion = await questionRepository.updateQuestion(
    question_id,
    data
  );

  return {
    success: true,
    statusCode: 200,
    message: "Cap nhat cau hoi thanh cong!",
    data: updatedQuestion,
  };
};

const deleteQuestion = async (question_id) => {
  const question = await questionRepository.findQuestionById(question_id);

  if (!question) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay cau hoi!",
    };
  }

  await questionRepository.deleteQuestion(question_id);

  return {
    success: true,
    statusCode: 200,
    message: "Xoa cau hoi thanh cong!",
  };
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  getQuestionsByVocabularyId,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};