const prisma = require("../config/prisma");

const getWrongVocabularies = async (account_id) => {
  return await prisma.question_results.findMany({
    where: {
      is_correct: false,
      session: {
        account_id: Number(account_id),
      },
    },
    include: {
      question: {
        include: {
          vocabulary: {
            include: {
              lesson: true,
            },
          },
        },
      },
    },
    orderBy: {
      answered_at: "desc",
    },
  });
};

const getFavoriteVocabularies = async (account_id) => {
  return await prisma.favorite_vocabularies.findMany({
    where: {
      account_id: Number(account_id),
    },
    include: {
      vocabulary: {
        include: {
          lesson: true,
        },
      },
    },
    orderBy: {
      added_date: "desc",
    },
  });
};

module.exports = {
  getWrongVocabularies,
  getFavoriteVocabularies,
};