const recommendationRepository = require("../repositories/recommendationRepository");
const vocabularyProgressRepository = require("../repositories/vocabularyProgressRepository");
const studyGoalRepository = require("../repositories/studyGoalRepository");

const priorityOrder = {
  high: 1,
  medium: 2,
  low: 3,
};

const removeDuplicateVocabularies = (recommendations) => {
  const map = new Map();

  recommendations.forEach((item) => {
    if (!map.has(item.vocabulary_id)) {
      map.set(item.vocabulary_id, item);
      return;
    }

    const oldItem = map.get(item.vocabulary_id);

    if (priorityOrder[item.priority] < priorityOrder[oldItem.priority]) {
      map.set(item.vocabulary_id, item);
    }
  });

  return Array.from(map.values());
};

const getNewWordsFromGoal = async (account_id) => {
  const activeGoal = await studyGoalRepository.findActiveGoalByAccountId(
    account_id
  );

  if (!activeGoal) {
    return [];
  }

  const vocabularies = await studyGoalRepository.findVocabulariesByLevel(
    activeGoal.jlpt_level
  );

  const today = new Date();
  const startDate = new Date(activeGoal.start_date);

  const dayIndex =
    Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

  const safeDayIndex = dayIndex >= 0 ? dayIndex : 0;

  const startIndex = safeDayIndex * activeGoal.daily_words;
  const endIndex = startIndex + activeGoal.daily_words;

  const todayWords = vocabularies.slice(startIndex, endIndex);

  return todayWords.map((vocab) => ({
    ...vocab,
    type: "new",
    typeLabel: "Từ mới hôm nay",
    reason: `Từ mới được đề xuất theo mục tiêu ${activeGoal.goal_name}`,
    priority: "low",
  }));
};

const getRecommendations = async (account_id) => {
  const dueProgress = await vocabularyProgressRepository.getDueVocabularies(
    account_id
  );

  const dueVocabularies = dueProgress.map((item) => ({
    ...item.vocabulary,
    type: "srs",
    typeLabel: "Từ sắp quên",
    reason: "Từ này đã đến hạn ôn tập theo thuật toán SRS",
    priority: "high",
  }));

  const wrongResults = await recommendationRepository.getWrongVocabularies(
    account_id
  );

  const wrongVocabularies = wrongResults.map((item) => ({
    ...item.question.vocabulary,
    type: "wrong",
    typeLabel: "Từ độ khó cao",
    reason: "Bạn từng trả lời sai từ này trong bài luyện tập",
    priority: "medium",
  }));

  const newWords = await getNewWordsFromGoal(account_id);

  const allRecommendations = [
    ...dueVocabularies,
    ...wrongVocabularies,
    ...newWords,
  ];

  const uniqueRecommendations =
    removeDuplicateVocabularies(allRecommendations);

  uniqueRecommendations.sort((a, b) => {
    const priorityCompare =
      priorityOrder[a.priority] - priorityOrder[b.priority];

    if (priorityCompare !== 0) {
      return priorityCompare;
    }

    return a.vocabulary_id - b.vocabulary_id;
  });

  return {
    success: true,
    statusCode: 200,
    message: "Lấy danh sách gợi ý học tập thành công!",
    data: uniqueRecommendations,
  };
};

module.exports = {
  getRecommendations,
};