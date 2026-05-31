const prisma = require("../config/prisma");

const countStudySessions = async (account_id) => {
  return await prisma.study_sessions.count({
    where: {
      account_id: Number(account_id),
    },
  });
};

const countQuestionResults = async (account_id) => {
  return await prisma.question_results.count({
    where: {
      session: {
        account_id: Number(account_id),
      },
    },
  });
};

const countCorrectAnswers = async (account_id) => {
  return await prisma.question_results.count({
    where: {
      is_correct: true,
      session: {
        account_id: Number(account_id),
      },
    },
  });
};

const countFavorites = async (account_id) => {
  return await prisma.favorite_vocabularies.count({
    where: {
      account_id: Number(account_id),
    },
  });
};

const countDueVocabularies = async (account_id) => {
  return await prisma.vocabulary_progress.count({
    where: {
      account_id: Number(account_id),
      next_review_at: {
        lte: new Date(),
      },
    },
  });
};

module.exports = {
  countStudySessions,
  countQuestionResults,
  countCorrectAnswers,
  countFavorites,
  countDueVocabularies,
};