const prisma = require("../config/prisma");

const getDashboardStatistics = async (account_id) => {
  const totalSessions = await prisma.study_sessions.count({
    where: {
      account_id: Number(account_id),
    },
  });

  const totalFavorites =
    await prisma.favorite_vocabularies.count({
      where: {
        account_id: Number(account_id),
      },
    });

  const sessions =
    await prisma.study_sessions.findMany({
      where: {
        account_id: Number(account_id),
      },
    });

  let totalQuestions = 0;
  let totalCorrect = 0;

  sessions.forEach((session) => {
    totalQuestions += session.total_questions || 0;
    totalCorrect += session.correct_answers || 0;
  });

  const accuracy =
    totalQuestions > 0
      ? Math.round(
          (totalCorrect / totalQuestions) * 100
        )
      : 0;

  return {
    success: true,
    statusCode: 200,

    data: {
      totalSessions,
      totalFavorites,
      totalQuestions,
      totalCorrect,
      accuracy,
    },
  };
};

module.exports = {
  getDashboardStatistics,
};