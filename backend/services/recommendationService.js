const recommendationRepository = require("../repositories/recommendationRepository");
const vocabularyProgressRepository = require("../repositories/vocabularyProgressRepository");

const removeDuplicateVocabularies = (vocabularies) => {
  const map = new Map();

  vocabularies.forEach((item) => {
    if (!map.has(item.vocabulary_id)) {
      map.set(item.vocabulary_id, item);
    }
  });

  return Array.from(map.values());
};

const getRecommendations = async (account_id) => {
  // 1. Lấy từ cần ôn theo SRS
  const dueProgress = await vocabularyProgressRepository.getDueVocabularies(
    account_id
  );

  const dueVocabularies = dueProgress.map((item) => ({
    ...item.vocabulary,
    reason: "Can on tap theo Spaced Repetition",
    priority: "high",
  }));

  // 2. Lấy từ từng trả lời sai
  const wrongResults = await recommendationRepository.getWrongVocabularies(
    account_id
  );

  const wrongVocabularies = wrongResults.map((item) => ({
    ...item.question.vocabulary,
    reason: "Ban tung tra loi sai tu nay",
    priority: "medium",
  }));

  // 3. Lấy từ yêu thích
  const favoriteResults = await recommendationRepository.getFavoriteVocabularies(
    account_id
  );

  const favoriteVocabularies = favoriteResults.map((item) => ({
    ...item.vocabulary,
    reason: "Tu nam trong danh sach yeu thich",
    priority: "low",
  }));

  // 4. Gộp tất cả lại
  const allRecommendations = [
    ...dueVocabularies,
    ...wrongVocabularies,
    ...favoriteVocabularies,
  ];

  // 5. Xóa trùng theo vocabulary_id
  const uniqueRecommendations =
    removeDuplicateVocabularies(allRecommendations);

  return {
    success: true,
    statusCode: 200,
    message: "Lay danh sach goi y hoc tap thanh cong!",
    data: uniqueRecommendations,
  };
};

module.exports = {
  getRecommendations,
};