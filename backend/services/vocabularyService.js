const vocabularyRepository = require("../repositories/vocabularyRepository");
const prisma = require("../config/prisma");

const getAllVocabularies = async () => {
  const vocabularies = await vocabularyRepository.findAllVocabularies();

  return {
    success: true,
    statusCode: 200,
    message: "Lay danh sach tu vung thanh cong!",
    data: vocabularies,
  };
};

const getVocabularyById = async (vocabulary_id) => {
  const vocabulary = await vocabularyRepository.findVocabularyById(
    vocabulary_id
  );

  if (!vocabulary) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay tu vung!",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: vocabulary,
  };
};

const getVocabulariesByLessonId = async (lesson_id) => {
  const vocabularies =
    await vocabularyRepository.findVocabulariesByLessonId(lesson_id);

  return {
    success: true,
    statusCode: 200,
    data: vocabularies,
  };
};

const createVocabulary = async (data) => {
  const newVocabulary = await vocabularyRepository.createVocabulary(data);

  return {
    success: true,
    statusCode: 201,
    message: "Them tu vung thanh cong!",
    data: newVocabulary,
  };
};

const updateVocabulary = async (vocabulary_id, data) => {
  const vocabulary = await vocabularyRepository.findVocabularyById(
    vocabulary_id
  );

  if (!vocabulary) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay tu vung!",
    };
  }

  const updatedVocabulary = await vocabularyRepository.updateVocabulary(
    vocabulary_id,
    data
  );

  return {
    success: true,
    statusCode: 200,
    message: "Cap nhat tu vung thanh cong!",
    data: updatedVocabulary,
  };
};

const deleteVocabulary = async (vocabulary_id) => {
  const vocabulary = await vocabularyRepository.findVocabularyById(
    vocabulary_id
  );

  if (!vocabulary) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay tu vung!",
    };
  }

  await vocabularyRepository.deleteVocabulary(vocabulary_id);

  return {
    success: true,
    statusCode: 200,
    message: "Xoa tu vung thanh cong!",
  };
};

const searchVocabulary = async (keyword) => {
  if (!keyword || keyword.trim() === "") {
    return {
      success: true,
      statusCode: 200,
      data: [],
    };
  }

  const vocabularies = await vocabularyRepository.searchVocabulary(keyword.trim());

  return {
    success: true,
    statusCode: 200,
    message: "Tìm kiếm từ vựng thành công!",
    data: vocabularies,
  };
};

// Import từ vựng hàng loạt
const bulkCreateVocabularies = async (vocabArray) => {
  // skipDuplicates giúp bỏ qua các từ đã tồn tại
  const result = await prisma.vocabularies.createMany({
    data: vocabArray,
    skipDuplicates: true, 
  });
  return { success: true, statusCode: 201, message: `Đã import thành công ${result.count} từ vựng!`, data: result };
};

module.exports = {
  getAllVocabularies,
  getVocabularyById,
  getVocabulariesByLessonId,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  searchVocabulary,
  bulkCreateVocabularies,
};