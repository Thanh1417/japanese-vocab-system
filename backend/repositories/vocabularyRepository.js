const prisma = require("../config/prisma");

const findAllVocabularies = async () => {
  return await prisma.vocabularies.findMany({
    include: {
      lesson: true,
    },
    orderBy: {
      vocabulary_id: "desc",
    },
  });
};

const findVocabularyById = async (vocabulary_id) => {
  return await prisma.vocabularies.findUnique({
    where: {
      vocabulary_id: Number(vocabulary_id),
    },
    include: {
      lesson: true,
    },
  });
};

const findVocabulariesByLessonId = async (lesson_id) => {
  return await prisma.vocabularies.findMany({
    where: {
      lesson_id: Number(lesson_id),
    },
    orderBy: {
      vocabulary_id: "desc",
    },
  });
};

const createVocabulary = async (data) => {
  return await prisma.vocabularies.create({
    data: {
      lesson_id: Number(data.lesson_id),
      word: data.word,
      reading: data.reading,
      kanji_meaning: data.kanji_meaning,
      vietnamese_meaning: data.vietnamese_meaning,
      example_sentence: data.example_sentence,
      audio_url: data.audio_url,
      jlpt_level: data.jlpt_level,
    },
  });
};

const updateVocabulary = async (vocabulary_id, data) => {
  return await prisma.vocabularies.update({
    where: {
      vocabulary_id: Number(vocabulary_id),
    },
    data: {
      lesson_id: Number(data.lesson_id),
      word: data.word,
      reading: data.reading,
      kanji_meaning: data.kanji_meaning,
      vietnamese_meaning: data.vietnamese_meaning,
      example_sentence: data.example_sentence,
      audio_url: data.audio_url,
      jlpt_level: data.jlpt_level,
    },
  });
};

const deleteVocabulary = async (vocabulary_id) => {
  return await prisma.vocabularies.delete({
    where: {
      vocabulary_id: Number(vocabulary_id),
    },
  });
};

// const searchVocabulary = async (keyword) => {
//   const vocabularies = await prisma.vocabularies.findMany({
//     where: {
//       OR: [
//         {
//           word: {
//             contains: keyword,
//           },
//         },
//         {
//           reading: {
//             contains: keyword,
//           },
//         },
//       ],
//     },
//     orderBy: {
//       vocabulary_id: "desc",
//     },
//   });

//   const uniqueWords = new Map();

//   vocabularies.forEach((item) => {
//     if (!uniqueWords.has(item.word)) {
//       uniqueWords.set(item.word, item);
//     }
//   });

//   return Array.from(uniqueWords.values()).slice(0, 10);
// };

const searchVocabulary = async (keyword) => {
  return await prisma.vocabularies.findMany({
    where: {
      word: {
        contains: keyword,
      },
    },
    distinct: ['word'], // Tránh trả về 1 từ nhiều lần nếu nó thuộc nhiều bài
    take: 10, // Giới hạn tối đa 10 kết quả
  });
};

module.exports = {
  findAllVocabularies,
  findVocabularyById,
  findVocabulariesByLessonId,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary,
  searchVocabulary,
};