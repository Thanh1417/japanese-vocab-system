const favoriteService = require("../services/favoriteService");

const addFavorite = async (req, res) => {
  try {
    const account_id = req.user.account_id;
    const vocabulary_id = req.params.vocabularyId;

    const result = await favoriteService.addFavorite(account_id, vocabulary_id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    const account_id = req.user.account_id;

    const result = await favoriteService.getMyFavorites(account_id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const account_id = req.user.account_id;
    const vocabulary_id = req.params.vocabularyId;

    const result = await favoriteService.removeFavorite(
      account_id,
      vocabulary_id
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
  addFavorite,
  getMyFavorites,
  removeFavorite,
};