const prisma = require("../config/prisma");

const findGoalsByAccountId = async (account_id) => {
  return await prisma.study_goals.findMany({
    where: {
      account_id: Number(account_id),
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

const findGoalById = async (goal_id) => {
  return await prisma.study_goals.findUnique({
    where: {
      goal_id: Number(goal_id),
    },
  });
};

const findActiveGoalByAccountId = async (account_id) => {
  return await prisma.study_goals.findFirst({
    where: {
      account_id: Number(account_id),
      status: "active",
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

const countWordsByLevel = async (jlpt_level) => {
  return await prisma.vocabularies.count({
    where: {
      jlpt_level,
    },
  });
};

const findVocabulariesByLevel = async (jlpt_level) => {
  return await prisma.vocabularies.findMany({
    where: {
      jlpt_level,
    },
    include: {
      lesson: true,
    },
    orderBy: [
      {
        lesson_id: "asc",
      },
      {
        vocabulary_id: "asc",
      },
    ],
  });
};

const createGoal = async (data) => {
  return await prisma.study_goals.create({
    data: {
      account_id: Number(data.account_id),
      goal_name: data.goal_name,
      jlpt_level: data.jlpt_level,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      total_words: Number(data.total_words),
      daily_words: Number(data.daily_words),
      status: data.status || "active",
    },
  });
};

const updateGoal = async (goal_id, data) => {
  return await prisma.study_goals.update({
    where: {
      goal_id: Number(goal_id),
    },
    data: {
      goal_name: data.goal_name,
      jlpt_level: data.jlpt_level,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      total_words: Number(data.total_words),
      daily_words: Number(data.daily_words),
      status: data.status || "active",
    },
  });
};

const deleteGoal = async (goal_id) => {
  return await prisma.study_goals.delete({
    where: {
      goal_id: Number(goal_id),
    },
  });
};

module.exports = {
  findGoalsByAccountId,
  findGoalById,
  findActiveGoalByAccountId,
  countWordsByLevel,
  findVocabulariesByLevel,
  createGoal,
  updateGoal,
  deleteGoal,
};