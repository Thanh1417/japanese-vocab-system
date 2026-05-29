const questionService = require("../services/questionService");

const getQuestions = async (req, res) => {
  try {
    const result = await questionService.getAllQuestions();

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getQuestionDetail = async (req, res) => {
  try {
    const result = await questionService.getQuestionById(req.params.id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getQuestionsByVocabulary = async (req, res) => {
  try {
    const result = await questionService.getQuestionsByVocabularyId(
      req.params.vocabularyId
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const createQuestion = async (req, res) => {
  try {
    const result = await questionService.createQuestion(req.body);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const result = await questionService.updateQuestion(
      req.params.id,
      req.body
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const result = await questionService.deleteQuestion(req.params.id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

module.exports = {
  getQuestions,
  getQuestionDetail,
  getQuestionsByVocabulary,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};