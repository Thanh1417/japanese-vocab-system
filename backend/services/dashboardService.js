const prisma = require("../config/prisma");

const getDashboardStatistics = async (account_id) => {
  const accountId = Number(account_id);

  const totalSessions = await prisma.study_sessions.count({
    where: { account_id: accountId },
  });

  const totalFavorites = await prisma.favorite_vocabularies.count({
    where: { account_id: accountId },
  });

  const learnedWords = await prisma.vocabulary_progress.count({
    where: { account_id: accountId },
  });

  const dueWords = await prisma.vocabulary_progress.count({
    where: {
      account_id: accountId,
      next_review_at: {
        lte: new Date(),
      },
    },
  });

  const activeGoal = await prisma.study_goals.findFirst({
    where: {
      account_id: accountId,
      status: "active",
    },
    orderBy: {
      created_at: "desc",
    },
  });

  let goalLearnedWords = 0;
  let goalProgress = 0;

  if (activeGoal) {
    goalLearnedWords = await prisma.vocabulary_progress.count({
      where: {
        account_id: accountId,
        vocabulary: {
          jlpt_level: activeGoal.jlpt_level,
        },
      },
    });

    goalProgress =
      activeGoal.total_words > 0
        ? Math.round((goalLearnedWords / activeGoal.total_words) * 100)
        : 0;
  }

  const sessions = await prisma.study_sessions.findMany({
    where: {
      account_id: accountId,
    },
    orderBy: {
      start_time: "asc",
    },
  });

  let totalQuestions = 0;
  let totalCorrect = 0;

  sessions.forEach((session) => {
    totalQuestions += session.total_questions || 0;
    totalCorrect += session.correct_answers || 0;
  });

  const accuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const activityMap = {};

  sessions.forEach((session) => {
    const dateKey = session.start_time.toISOString().slice(0, 10);

    if (!activityMap[dateKey]) {
      activityMap[dateKey] = 0;
    }

    activityMap[dateKey] += 1;
  });

  const activityHeatmap = [];

  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const dateKey = date.toISOString().slice(0, 10);

    activityHeatmap.push({
      date: dateKey,
      count: activityMap[dateKey] || 0,
    });
  }

  return {
    success: true,
    statusCode: 200,
    data: {
      totalSessions,
      totalFavorites,
      totalQuestions,
      totalCorrect,
      accuracy,
      learnedWords,
      dueWords,
      activeGoal,
      goalLearnedWords,
      goalProgress,
      activityHeatmap,
    },
  };
};

module.exports = {
  getDashboardStatistics,
};