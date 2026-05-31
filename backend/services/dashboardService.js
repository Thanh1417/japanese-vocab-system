const dashboardRepository = require("../repositories/dashboardRepository");

const getOverview = async (account_id) => {
  const totalSessions = await dashboardRepository.countStudySessions(account_id);
  const totalQuestions = await dashboardRepository.countQuestionResults(account_id);
  const correctAnswers = await dashboardRepository.countCorrectAnswers(account_id);
  const favoriteCount = await dashboardRepository.countFavorites(account_id);
  const dueVocabularyCount = await dashboardRepository.countDueVocabularies(account_id);

  const accuracyRate =
    totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);

  return {
    success: true,
    statusCode: 200,
    message: "Lay thong ke tong quan thanh cong!",
    data: {
      total_sessions: totalSessions,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      accuracy_rate: accuracyRate,
      favorite_count: favoriteCount,
      due_vocabulary_count: dueVocabularyCount,
    },
  };
};

module.exports = {
  getOverview,
};