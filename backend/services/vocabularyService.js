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

const normalizeText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).normalize("NFC").trim();
};

const normalizeKey = (value) => normalizeText(value).toLowerCase();

// Import từ vựng hàng loạt
const bulkCreateVocabularies = async (vocabArray = []) => {
  if (!Array.isArray(vocabArray) || vocabArray.length === 0) {
    return {
      success: false,
      statusCode: 400,
      message: "Không có dữ liệu từ vựng để import!",
    };
  }

  const lessons = await prisma.lessons.findMany({
    select: {
      lesson_id: true,
      lesson_name: true,
      jlpt_level: true,
    },
  });

  const lessonMap = new Map();
  lessons.forEach((lesson) => {
    const key = `${normalizeKey(lesson.lesson_name)}::${normalizeKey(lesson.jlpt_level)}`;
    lessonMap.set(key, lesson.lesson_id);
  });

  const validRows = [];
  const errors = [];

  vocabArray.forEach((row, index) => {
    const lessonName = normalizeText(
      row.lesson_name || row.lessonName || row.lesson || row.LessonName || row.Lesson
    );
    const lessonIdInput = row.lesson_id ?? row.lessonId ?? row.lessonID;
    const word = normalizeText(row.word || row.Word || row.vocabulary || row.kanji);
    const reading = normalizeText(row.reading || row.Reading || row.furigana || row.cuachoc);
    const kanjiMeaning = normalizeText(
      row.kanji_meaning || row.kanjiMeaning || row.kanji || row.HanTu || row.han_tu
    );
    const vietnameseMeaning = normalizeText(
      row.vietnamese_meaning || row.vietnameseMeaning || row.meaning || row.nghia || row.vietnamese
    );
    const jlptLevel = normalizeText(row.jlpt_level || row.jlpt || row.level || row.JLPT || "N5");

    let resolvedLessonId = lessonIdInput ? Number(lessonIdInput) : null;

    if (!resolvedLessonId && lessonName) {
      const lessonKey = `${normalizeKey(lessonName)}::${normalizeKey(jlptLevel)}`;
      resolvedLessonId = lessonMap.get(lessonKey) || null;
    }

    if (!word || !vietnameseMeaning) {
      errors.push({
        row: index + 2,
        message: "Thiếu từ vựng hoặc nghĩa tiếng Việt",
      });
      return;
    }

    if (!resolvedLessonId) {
      errors.push({
        row: index + 2,
        message: `Không tìm thấy bài học phù hợp cho lesson_name: ${lessonName || "(trống)"}`,
      });
      return;
    }

    validRows.push({
      lesson_id: resolvedLessonId,
      word,
      reading: reading || null,
      kanji_meaning: kanjiMeaning || null,
      vietnamese_meaning: vietnameseMeaning,
      example_sentence: null,
      audio_url: null,
      jlpt_level: jlptLevel || "N5",
    });
  });

  if (validRows.length === 0) {
    return {
      success: false,
      statusCode: 400,
      message: "Không có dòng hợp lệ nào để import.",
      data: errors,
    };
  }

  const result = await prisma.vocabularies.createMany({
    data: validRows,
    skipDuplicates: true,
  });

  return {
    success: true,
    statusCode: 201,
    message: `Đã import thành công ${result.count} từ vựng!`,
    data: {
      importedCount: result.count,
      totalRows: vocabArray.length,
      errorCount: errors.length,
      errors,
    },
  };
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