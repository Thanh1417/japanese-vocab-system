const prisma = require("../config/prisma");

const findAllLessons = async () => {
  return await prisma.lessons.findMany({
    orderBy: {
      lesson_id: "desc",
    },
  });
};

const findLessonById = async (lesson_id) => {
  return await prisma.lessons.findUnique({
    where: {
      lesson_id: Number(lesson_id),
    },
  });
};

const createLesson = async (data) => {
  return await prisma.lessons.create({
    data: {
      lesson_name: data.lesson_name,
      jlpt_level: data.jlpt_level,
      total_words: data.total_words || 0,
    },
  });
};

const updateLesson = async (lesson_id, data) => {
  return await prisma.lessons.update({
    where: {
      lesson_id: Number(lesson_id),
    },
    data: {
      lesson_name: data.lesson_name,
      jlpt_level: data.jlpt_level,
      total_words: data.total_words,
    },
  });
};

const deleteLesson = async (lesson_id) => {
  return await prisma.lessons.delete({
    where: {
      lesson_id: Number(lesson_id),
    },
  });
};

module.exports = {
  findAllLessons,
  findLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};