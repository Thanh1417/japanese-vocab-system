const prisma = require("../config/prisma");

const findAllQuestions = async () => {
  return await prisma.questions.findMany({
    include: {
      vocabulary: true,
    },
    orderBy: {
      question_id: "desc",
    },
  });
};

const findQuestionById = async (question_id) => {
  return await prisma.questions.findUnique({
    where: {
      question_id: Number(question_id),
    },
    include: {
      vocabulary: true,
    },
  });
};

const findQuestionsByVocabularyId = async (vocabulary_id) => {
  return await prisma.questions.findMany({
    where: {
      vocabulary_id: Number(vocabulary_id),
    },
    orderBy: {
      question_id: "desc",
    },
  });
};

const createQuestion = async (data) => {
  return await prisma.questions.create({
    data: {
      vocabulary_id: Number(data.vocabulary_id),
      content: data.content,
      question_type: data.question_type,
      correct_answer: data.correct_answer,
      options: data.options ? data.options : null,
    },
  });
};

const updateQuestion = async (question_id, data) => {
  return await prisma.questions.update({
    where: {
      question_id: Number(question_id),
    },
    data: {
      vocabulary_id: Number(data.vocabulary_id),
      content: data.content,
      question_type: data.question_type,
      correct_answer: data.correct_answer,
      options: data.options ? data.options : null,
    },
  });
};

const deleteQuestion = async (question_id) => {
  return await prisma.questions.delete({
    where: {
      question_id: Number(question_id),
    },
  });
};

module.exports = {
  findAllQuestions,
  findQuestionById,
  findQuestionsByVocabularyId,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};