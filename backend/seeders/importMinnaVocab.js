const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");

const DATA_PATH = path.join(__dirname, "data", "minna_vocab_table.json");

const getOrCreateLesson = async (item) => {
  let lesson = await prisma.lessons.findFirst({
    where: {
      lesson_name: item.lesson_name,
    },
  });

  if (!lesson) {
    lesson = await prisma.lessons.create({
      data: {
        lesson_name: item.lesson_name,
        jlpt_level: item.jlpt_level,
        total_words: 0,
      },
    });
  }

  return lesson;
};

const isVocabularyExists = async (lesson_id, word, reading) => {
  const existingVocabulary = await prisma.vocabularies.findFirst({
    where: {
      lesson_id: Number(lesson_id),
      word: word,
      reading: reading,
    },
  });

  return !!existingVocabulary;
};

const importMinnaVocab = async () => {
  const rawData = fs.readFileSync(DATA_PATH, "utf-8");
  const vocabularies = JSON.parse(rawData);

  console.log(`Dang import ${vocabularies.length} tu vung...`);

  let importedCount = 0;
  let skippedCount = 0;

  for (const item of vocabularies) {
    const lesson = await getOrCreateLesson(item);

    const exists = await isVocabularyExists(
      lesson.lesson_id,
      item.word,
      item.reading
    );

    if (exists) {
      skippedCount++;
      continue;
    }

    const vocabulary = await prisma.vocabularies.create({
      data: {
        lesson_id: lesson.lesson_id,
        word: item.word,
        reading: item.reading || null,
        kanji_meaning: item.kanji_meaning || null,
        vietnamese_meaning: item.vietnamese_meaning,
        example_sentence: item.example_sentence || null,
        audio_url: item.audio_url || null,
        jlpt_level: item.jlpt_level,
      },
    });

    await prisma.questions.create({
      data: {
        vocabulary_id: vocabulary.vocabulary_id,
        content: `${item.word} có nghĩa là gì?`,
        question_type: "typing",
        correct_answer: item.vietnamese_meaning,
      },
    });

    importedCount++;
  }

  const lessons = await prisma.lessons.findMany();

  for (const lesson of lessons) {
    const totalWords = await prisma.vocabularies.count({
      where: {
        lesson_id: lesson.lesson_id,
      },
    });

    await prisma.lessons.update({
      where: {
        lesson_id: lesson.lesson_id,
      },
      data: {
        total_words: totalWords,
      },
    });
  }

  console.log("Import thanh cong!");
  console.log(`So tu da them: ${importedCount}`);
  console.log(`So tu bo qua do da ton tai: ${skippedCount}`);
};

importMinnaVocab()
  .catch((error) => {
    console.error("Import loi:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });