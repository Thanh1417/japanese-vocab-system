const studySessionService = require("../services/studySessionService");

const startStudySession = async (req, res) => {
  try {
    const account_id = req.user.account_id;

    const result = await studySessionService.startStudySession(
      account_id,
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

const getStudySessionDetail = async (req, res) => {
  try {
    const result = await studySessionService.getStudySessionById(req.params.id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getMyStudySessions = async (req, res) => {
  try {
    const account_id = req.user.account_id;

    const result = await studySessionService.getMyStudySessions(account_id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const endStudySession = async (req, res) => {
  try {
    const result = await studySessionService.endStudySession(
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

module.exports = {
  startStudySession,
  getStudySessionDetail,
  getMyStudySessions,
  endStudySession,
};