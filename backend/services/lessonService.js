const lessonRepository = require("../repositories/lessonRepository");

const getAllLessons = async () => {
  return await lessonRepository.findAllLessons();
};

const getLessonById = async (lesson_id) => {
  const lesson = await lessonRepository.findLessonById(lesson_id);

  if (!lesson) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay bai hoc!",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: lesson,
  };
};

const createLesson = async (data) => {
  const newLesson = await lessonRepository.createLesson(data);

  return {
    success: true,
    statusCode: 201,
    message: "Tao bai hoc thanh cong!",
    data: newLesson,
  };
};

const updateLesson = async (lesson_id, data) => {
  const existingLesson = await lessonRepository.findLessonById(lesson_id);

  if (!existingLesson) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay bai hoc!",
    };
  }

  const updatedLesson = await lessonRepository.updateLesson(lesson_id, data);

  return {
    success: true,
    statusCode: 200,
    message: "Cap nhat bai hoc thanh cong!",
    data: updatedLesson,
  };
};

const deleteLesson = async (lesson_id) => {
  const existingLesson = await lessonRepository.findLessonById(lesson_id);

  if (!existingLesson) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay bai hoc!",
    };
  }

  await lessonRepository.deleteLesson(lesson_id);

  return {
    success: true,
    statusCode: 200,
    message: "Xoa bai hoc thanh cong!",
  };
};

module.exports = {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};