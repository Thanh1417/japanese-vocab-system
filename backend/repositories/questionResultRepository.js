const prisma = require("../config/prisma");

const createQuestionResult = async (data) => {
  return await prisma.question_results.create({
    data,
  });
};

const findResultsBySessionId = async (session_id) => {
  return await prisma.question_results.findMany({
    where: {
      session_id: Number(session_id),
    },
    include: {
      question: {
        include: {
          vocabulary: true,
        },
      },
      vocabulary: true,
    },
  });
};

module.exports = {
  createQuestionResult,
  findResultsBySessionId,
};