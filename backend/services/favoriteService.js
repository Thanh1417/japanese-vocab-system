const favoriteRepository = require("../repositories/favoriteRepository");
const vocabularyRepository = require("../repositories/vocabularyRepository");

const addFavorite = async (account_id, vocabulary_id) => {
  const vocabulary = await vocabularyRepository.findVocabularyById(vocabulary_id);

  if (!vocabulary) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay tu vung!",
    };
  }

  const existingFavorite = await favoriteRepository.findFavorite(
    account_id,
    vocabulary_id
  );

  if (existingFavorite) {
    return {
      success: false,
      statusCode: 400,
      message: "Tu vung da co trong danh sach yeu thich!",
    };
  }

  const favorite = await favoriteRepository.createFavorite(
    account_id,
    vocabulary_id
  );

  return {
    success: true,
    statusCode: 201,
    message: "Them tu vung vao yeu thich thanh cong!",
    data: favorite,
  };
};

const getMyFavorites = async (account_id) => {
  const favorites = await favoriteRepository.findFavoritesByAccountId(
    account_id
  );

  return {
    success: true,
    statusCode: 200,
    message: "Lay danh sach tu vung yeu thich thanh cong!",
    data: favorites,
  };
};

const removeFavorite = async (account_id, vocabulary_id) => {
  const existingFavorite = await favoriteRepository.findFavorite(
    account_id,
    vocabulary_id
  );

  if (!existingFavorite) {
    return {
      success: false,
      statusCode: 404,
      message: "Tu vung chua co trong danh sach yeu thich!",
    };
  }

  await favoriteRepository.deleteFavorite(account_id, vocabulary_id);

  return {
    success: true,
    statusCode: 200,
    message: "Xoa tu vung khoi yeu thich thanh cong!",
  };
};

module.exports = {
  addFavorite,
  getMyFavorites,
  removeFavorite,
};