const studyGoalRepository = require("../repositories/studyGoalRepository");

const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays > 0 ? diffDays : 0;
};

const getMyGoals = async (account_id) => {
    const goals = await studyGoalRepository.findGoalsByAccountId(account_id);

    const goalsWithProgress = await Promise.all(
        goals.map(async (goal) => {
            // Lấy số từ thực tế user đã học ở cấp độ này
            const learnedWords = await studyGoalRepository.countLearnedWordsByLevel(
                account_id,
                goal.jlpt_level
            );

            // Tính %
            let progress = 0;
            if (goal.total_words > 0) {
                progress = Math.round((learnedWords / goal.total_words) * 100);
            }
            if (progress > 100) progress = 100;

            let currentStatus = goal.status;

            // NẾU đạt 100% VÀ trạng thái vẫn đang là active -> Tự động update database thành completed
            if (progress === 100 && currentStatus !== "completed") {
                await studyGoalRepository.updateGoal(goal.goal_id, {
                    goal_name: goal.goal_name,
                    jlpt_level: goal.jlpt_level,
                    start_date: goal.start_date,
                    end_date: goal.end_date,
                    total_words: goal.total_words,
                    daily_words: goal.daily_words,
                    status: "completed",
                });
                currentStatus = "completed";
            }

            return {
                ...goal,
                status: currentStatus,
                learned_words: learnedWords,
                progress: progress,
            };
        })
    );

    return {
        success: true,
        statusCode: 200,
        message: "Lấy danh sách mục tiêu thành công",
        data: goalsWithProgress,
    };
};

// const getMyGoals = async (account_id) => {
//     const goals = await studyGoalRepository.findGoalsByAccountId(account_id);

//     return {
//         success: true,
//         statusCode: 200,
//         message: "Lấy danh sách mục tiêu thành công",
//         data: goals,
//     };
// };

const getActiveGoal = async (account_id) => {
    const goal = await studyGoalRepository.findActiveGoalByAccountId(account_id);

    return {
        success: true,
        statusCode: 200,
        message: "Lấy mục tiêu hiện tại thành công",
        data: goal,
    };
};

const createGoal = async (account_id, data) => {
    const { goal_name, jlpt_level, start_date, end_date } = data;

    if (!goal_name || !jlpt_level || !start_date || !end_date) {
        return {
            success: false,
            statusCode: 400,
            message: "Vui lòng nhập đầy đủ thông tin",
        };
    }

    const totalDays = calculateDays(start_date, end_date);

    if (totalDays <= 0) {
        return {
            success: false,
            statusCode: 400,
            message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
        };
    }

    const totalWords = await studyGoalRepository.countWordsByLevel(jlpt_level);
    const dailyWords = Math.ceil(totalWords / totalDays);

    const goal = await studyGoalRepository.createGoal({
        account_id,
        goal_name,
        jlpt_level,
        start_date,
        end_date,
        total_words: totalWords,
        daily_words: dailyWords,
        status: "active",
    });

    return {
        success: true,
        statusCode: 201,
        message: "Tạo mục tiêu học tập thành công",
        data: goal,
    };
};

const updateGoal = async (account_id, goal_id, data) => {
    const oldGoal = await studyGoalRepository.findGoalById(goal_id);

    if (!oldGoal || oldGoal.account_id !== Number(account_id)) {
        return {
            success: false,
            statusCode: 404,
            message: "Không tìm thấy mục tiêu học tập",
        };
    }

    const { goal_name, jlpt_level, start_date, end_date, status } = data;

    if (!goal_name || !jlpt_level || !start_date || !end_date) {
        return {
            success: false,
            statusCode: 400,
            message: "Vui lòng nhập đầy đủ thông tin",
        };
    }

    const totalDays = calculateDays(start_date, end_date);

    if (totalDays <= 0) {
        return {
            success: false,
            statusCode: 400,
            message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
        };
    }

    const totalWords = await studyGoalRepository.countWordsByLevel(jlpt_level);
    const dailyWords = Math.ceil(totalWords / totalDays);

    const goal = await studyGoalRepository.updateGoal(goal_id, {
        goal_name,
        jlpt_level,
        start_date,
        end_date,
        total_words: totalWords,
        daily_words: dailyWords,
        status: status || "active",
    });

    return {
        success: true,
        statusCode: 200,
        message: "Cập nhật mục tiêu học tập thành công",
        data: goal,
    };
};

const deleteGoal = async (account_id, goal_id) => {
    const goal = await studyGoalRepository.findGoalById(goal_id);

    if (!goal || goal.account_id !== Number(account_id)) {
        return {
            success: false,
            statusCode: 404,
            message: "Không tìm thấy mục tiêu học tập",
        };
    }

    await studyGoalRepository.deleteGoal(goal_id);

    return {
        success: true,
        statusCode: 200,
        message: "Xoá mục tiêu học tập thành công",
    };
};

const prisma = require("../config/prisma"); // gọi DB

const getGoalDailyPlan = async (account_id, goal_id) => {
    const studyGoalRepository = require("../repositories/studyGoalRepository");
    const goal = await studyGoalRepository.findGoalById(goal_id);

    if (!goal || goal.account_id !== Number(account_id)) {
        return { success: false, statusCode: 404, message: "Không tìm thấy mục tiêu học tập" };
    }

    const vocabularies = await studyGoalRepository.findVocabulariesByLevel(goal.jlpt_level);

    if (vocabularies.length === 0) {
        return { success: true, statusCode: 200, message: "Không có từ vựng", data: { goal, plans: [] } };
    }

    // Lấy danh sách toàn bộ ID từ vựng mà user đã học thuộc JLPT này
    const learnedProgress = await prisma.vocabulary_progress.findMany({
        where: {
            account_id: Number(account_id),
            vocabulary: { jlpt_level: goal.jlpt_level }
        },
        select: { vocabulary_id: true }
    });
    const learnedSet = new Set(learnedProgress.map(p => p.vocabulary_id));

    const start = new Date(goal.start_date);
    const end = new Date(goal.end_date);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dailyWords = goal.daily_words || Math.ceil(vocabularies.length / totalDays);
    const plans = [];

    for (let i = 0; i < totalDays; i++) {
        const startIndex = i * dailyWords;
        const endIndex = startIndex + dailyWords;
        const words = vocabularies.slice(startIndex, endIndex);

        if (words.length === 0) break;

        // Đếm số từ đã học trong ngày hôm nay
        let learnedCount = 0;
        words.forEach(w => {
            if (learnedSet.has(w.vocabulary_id)) learnedCount++;
        });

        let progress = words.length > 0 ? Math.round((learnedCount / words.length) * 100) : 0;
        if (progress > 100) progress = 100;

        const date = new Date(start);
        date.setDate(start.getDate() + i);

        plans.push({
            day_number: i + 1,
            date: date.toISOString(),
            title: `Ngày ${i + 1}`,
            total_words: words.length,
            learned_words: learnedCount,
            progress: progress, // Trả về % của ngày
            words,
        });
    }

    return {
        success: true,
        statusCode: 200,
        message: "Lấy lộ trình học mỗi ngày thành công",
        data: { goal, plans },
    };
};

const getGoalDayDetail = async (account_id, goal_id, day_number) => {
  const goal = await studyGoalRepository.findGoalById(goal_id);

  if (!goal || goal.account_id !== Number(account_id)) {
    return {
      success: false,
      statusCode: 404,
      message: "Không tìm thấy mục tiêu học tập",
    };
  }

  const vocabularies = await studyGoalRepository.findVocabulariesByLevel(
    goal.jlpt_level
  );

  const start = new Date(goal.start_date);
  const dailyWords = goal.daily_words;
  const dayNumber = Number(day_number);

  const startIndex = (dayNumber - 1) * dailyWords;
  const endIndex = startIndex + dailyWords;

  const words = vocabularies.slice(startIndex, endIndex);

  const date = new Date(start);
  date.setDate(start.getDate() + dayNumber - 1);

  // --- LOGIC TÍNH TIẾN ĐỘ NGÀY ---
  const wordIds = words.map((w) => w.vocabulary_id);
  const learnedWordsCount = await studyGoalRepository.countLearnedWordsByArray(account_id, wordIds);

  let progress = words.length > 0 ? Math.round((learnedWordsCount / words.length) * 100) : 0;
  if (progress > 100) progress = 100;

  return {
    success: true,
    statusCode: 200,
    message: "Lấy chi tiết ngày học thành công",
    data: {
      goal,
      day_number: dayNumber,
      date: date.toISOString(),
      total_words: words.length,
      learned_words: learnedWordsCount,
      progress: progress,
      words,
    },
  };
};

module.exports = {
    getMyGoals,
    getActiveGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    getGoalDailyPlan,
    getGoalDayDetail,
};