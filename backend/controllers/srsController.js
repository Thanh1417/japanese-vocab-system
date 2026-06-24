const srsService = require("../services/srsService");

const getDueVocabularies = async (req, res) => {
  try {
    const account_id = req.user.account_id;
    const result = await srsService.getDueVocabularies(account_id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

const reviewVocabulary = async (req, res) => {
  try {
    const account_id = req.user.account_id;
    // NHẬN RATING VÀ SESSION_ID THAY VÌ is_correct
    const { vocabulary_id, rating, session_id } = req.body;

    const result = await srsService.reviewVocabulary(
      account_id,
      vocabulary_id,
      rating,
      session_id
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Lỗi server!" });
  }
};

module.exports = {
  getDueVocabularies,
  reviewVocabulary,
};