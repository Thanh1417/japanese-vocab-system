const srsService = require("../services/srsService");

const getDueVocabularies = async (req, res) => {
  try {
    const account_id = req.user.account_id;

    const result = await srsService.getDueVocabularies(account_id);

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
  getDueVocabularies,
};