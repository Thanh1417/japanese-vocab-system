const questionResultService = require("../services/questionResultService");

const createQuestionResult = async (req, res) => {
  try {
    const result = await questionResultService.createQuestionResult(req.body);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Loi server!",
    });
  }
};

const getResultsBySession = async (req, res) => {
  try {
    const result = await questionResultService.getResultsBySessionId(
      req.params.sessionId
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Loi server!",
    });
  }
};

module.exports = {
  createQuestionResult,
  getResultsBySession,
};