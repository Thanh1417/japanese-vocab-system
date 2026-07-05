const prisma = require("../config/prisma");

const formatDateKey = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateRange = (range) => {
  const days = Number(range) || 30;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate, days };
};

const calculateStudyMinutes = (sessions) => {
  const totalSeconds = sessions.reduce((total, session) => {
    if (!session.start_time || !session.end_time) return total;
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    return total + (end.getTime() - start.getTime()) / 1000;
  }, 0);
  return Math.max(0, Math.ceil(totalSeconds / 60));
};

const calculateStreak = (activeDatesArray) => {
  const studiedDates = new Set(activeDatesArray.map((date) => formatDateKey(date)).filter(Boolean));
  let streak = 0;
  const currentDate = new Date();
  let dateKey = formatDateKey(currentDate);

  if (!studiedDates.has(dateKey)) {
    currentDate.setDate(currentDate.getDate() - 1);
    dateKey = formatDateKey(currentDate);
    if (!studiedDates.has(dateKey)) return 0;
  }

  while (true) {
    if (!studiedDates.has(dateKey)) break;
    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
    dateKey = formatDateKey(currentDate);
  }
  return streak;
};

const getDashboardStatistics = async (account_id, range) => {
  const accountId = Number(account_id);
  const { startDate, endDate, days } = getDateRange(range);

  const totalFavorites = await prisma.favorite_vocabularies.count({ where: { account_id: accountId } });
  const learnedWords = await prisma.vocabulary_progress.count({ where: { account_id: accountId } });
  const dueWords = await prisma.vocabulary_progress.count({
    where: { account_id: accountId, next_review_at: { lte: new Date() } },
  });

  // LẤY TẤT CẢ MỤC TIÊU ĐANG HỌC (ACTIVE) THAY VÌ CHỈ 1 CÁI
  const activeGoalsData = await prisma.study_goals.findMany({
    where: { account_id: accountId, status: "active" },
    orderBy: { created_at: "desc" },
  });

  const activeGoals = await Promise.all(
    activeGoalsData.map(async (goal) => {
      const goalLearnedWords = await prisma.vocabulary_progress.count({
        where: { account_id: accountId, vocabulary: { jlpt_level: goal.jlpt_level } },
      });
      let goalProgress = goal.total_words > 0 ? Math.round((goalLearnedWords / goal.total_words) * 100) : 0;
      if (goalProgress > 100) goalProgress = 100;

      return {
        ...goal,
        goalLearnedWords,
        goalProgress,
      };
    })
  );

  const sessions = await prisma.study_sessions.findMany({
    where: { account_id: accountId, start_time: { gte: startDate, lte: endDate } },
    orderBy: { start_time: "asc" },
  });

  const questionResults = await prisma.question_results.findMany({
    where: { session: { account_id: accountId }, answered_at: { gte: startDate, lte: endDate } },
    include: {
      question: { include: { vocabulary: true } },
      vocabulary: true
    },
    orderBy: { answered_at: "asc" },
  });

  const allSessions = await prisma.study_sessions.findMany({
    where: { account_id: accountId },
    select: { start_time: true },
  });

  const flashcardReviews = await prisma.vocabulary_progress.findMany({
    where: { account_id: accountId, last_reviewed_at: { not: null } },
    select: { last_reviewed_at: true },
  });

  const activeDates = [...allSessions.map(s => s.start_time), ...flashcardReviews.map(f => f.last_reviewed_at)];
  const studyStreak = calculateStreak(activeDates);

  const totalSessions = sessions.length;
  const totalQuestions = questionResults.length;
  const totalCorrect = questionResults.filter((item) => item.is_correct).length;
  const totalWrong = totalQuestions - totalCorrect;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalStudyMinutes = calculateStudyMinutes(sessions);

  const dailyMap = {};
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = formatDateKey(date);
    dailyMap[dateKey] = {
      date: dateKey,
      sessions: 0,
      questions: 0,
      correct: 0,
      wrong: 0,
      minutes: 0, // THÊM TRƯỜNG LƯU SỐ PHÚT HỌC MỖI NGÀY
    };
  }

  sessions.forEach((session) => {
    const dateKey = formatDateKey(session.start_time);
    if (dailyMap[dateKey]) {
      dailyMap[dateKey].sessions += 1;
      if (session.end_time) {
        const diffSeconds = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000;
        dailyMap[dateKey].minutes += (diffSeconds / 60);
      }
    }
  });

  questionResults.forEach((result) => {
    const dateKey = formatDateKey(result.answered_at);
    if (dailyMap[dateKey]) {
      dailyMap[dateKey].questions += 1;
      if (result.is_correct) dailyMap[dateKey].correct += 1;
      else dailyMap[dateKey].wrong += 1;
    }
  });

  const dailyStats = Object.values(dailyMap).map(item => ({
    ...item,
    minutes: Math.ceil(item.minutes) // Làm tròn lên số phút nguyên
  }));
  const levelMap = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
  questionResults.forEach((result) => {
    // Lấy level từ Flashcard (vocabulary) hoặc Quiz (question.vocabulary)
    const level = result.vocabulary?.jlpt_level || result.question?.vocabulary?.jlpt_level;
    if (level && levelMap[level] !== undefined) levelMap[level] += 1;
  });

  const levelStats = Object.keys(levelMap).map((level) => ({ level, count: levelMap[level] }));
  const heatmap = dailyStats.map((item) => ({ date: item.date, count: item.sessions + item.questions }));

  return {
    success: true,
    statusCode: 200,
    data: {
      range: days,
      totalSessions,
      totalFavorites,
      totalQuestions,
      totalCorrect,
      totalWrong,
      accuracy,
      learnedWords,
      dueWords,
      totalStudyMinutes,
      studyStreak,
      activeGoals, // TRẢ VỀ MẢNG CÁC MỤC TIÊU
      dailyStats,
      levelStats,
      heatmap,
    },
  };
};

const getAdminDashboardStatistics = async (range) => {
  const { startDate, endDate, days } = getDateRange(range);

  // 1. Thống kê thực thể hệ thống (Không phụ thuộc thời gian)
  const totalUsers = await prisma.accounts.count({ where: { role: 'learner' } });
  const totalVocabularies = await prisma.vocabularies.count();
  const totalSystemQuestions = await prisma.questions.count();

  // 2. Thống kê theo thời gian (Bộ lọc Range)
  const totalSessions = await prisma.study_sessions.count({
    where: { start_time: { gte: startDate, lte: endDate } }
  });

  const totalFavorites = await prisma.favorite_vocabularies.count({
    where: { added_date: { gte: startDate, lte: endDate } }
  });

  // Quét toàn bộ kết quả trả lời câu hỏi trong hệ thống
  const questionResults = await prisma.question_results.findMany({
    where: { answered_at: { gte: startDate, lte: endDate } },
    include: { question: { include: { vocabulary: true } } }
  });

  const totalQuestions = questionResults.length;
  const totalCorrect = questionResults.filter(q => q.is_correct).length;
  const totalWrong = totalQuestions - totalCorrect;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // 3. Tỷ lệ hoàn thành Mục tiêu học tập
  const allGoals = await prisma.study_goals.findMany();
  const completedGoals = allGoals.filter(g => g.status === 'completed').length;
  const goalCompletionRate = allGoals.length > 0 ? Math.round((completedGoals / allGoals.length) * 100) : 0;

  // 4. Nội dung được học nhiều nhất (Phân bổ theo Cấp độ)
  const levelMap = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
  questionResults.forEach((res) => {
    const level = res.question?.vocabulary?.jlpt_level;
    if (level && levelMap[level] !== undefined) levelMap[level] += 1;
  });

  // Sắp xếp giảm dần để lấy Top
  const topLevels = Object.keys(levelMap)
    .map(level => ({ level, count: levelMap[level] }))
    .sort((a, b) => b.count - a.count);

  return {
    success: true,
    statusCode: 200,
    data: {
      range: days,
      totalUsers, totalVocabularies, totalSystemQuestions,
      totalSessions, totalQuestions, totalCorrect, totalWrong, accuracy, totalFavorites,
      goalCompletionRate, topLevels
    }
  };
};

module.exports = {
  getDashboardStatistics,
  getAdminDashboardStatistics,
};