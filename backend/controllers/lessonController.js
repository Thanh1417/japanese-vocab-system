const lessonService = require("../services/lessonService");

const getLessons = async (req, res) => {
  try {
    const lessons = await lessonService.getAllLessons();

    return res.status(200).json({
      success: true,
      message: "Lay danh sach bai hoc thanh cong!",
      data: lessons,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getLessonDetail = async (req, res) => {
  try {
    const result = await lessonService.getLessonById(req.params.id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const createLesson = async (req, res) => {
  try {
    const result = await lessonService.createLesson(req.body);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const updateLesson = async (req, res) => {
  try {
    const result = await lessonService.updateLesson(req.params.id, req.body);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const result = await lessonService.deleteLesson(req.params.id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

module.exports = {
  getLessons,
  getLessonDetail,
  createLesson,
  updateLesson,
  deleteLesson,
};