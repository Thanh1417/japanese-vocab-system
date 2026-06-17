const vocabularyService = require("../services/vocabularyService");

const getVocabularies = async (req, res) => {
  try {
    const result = await vocabularyService.getAllVocabularies();

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getVocabularyDetail = async (req, res) => {
  try {
    const result = await vocabularyService.getVocabularyById(req.params.id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const getVocabulariesByLesson = async (req, res) => {
  try {
    const result = await vocabularyService.getVocabulariesByLessonId(
      req.params.lessonId
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const createVocabulary = async (req, res) => {
  try {
    const result = await vocabularyService.createVocabulary(req.body);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const updateVocabulary = async (req, res) => {
  try {
    const result = await vocabularyService.updateVocabulary(
      req.params.id,
      req.body
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const deleteVocabulary = async (req, res) => {
  try {
    const result = await vocabularyService.deleteVocabulary(req.params.id);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Loi server!",
    });
  }
};

const searchVocabulary = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const result = await vocabularyService.searchVocabulary(keyword);

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
  getVocabularies,
  getVocabularyDetail,
  getVocabulariesByLesson,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  searchVocabulary,
};