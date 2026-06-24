const questionRepository = require("../repositories/questionRepository");
const prisma = require("../config/prisma"); // Bắt buộc phải có để truy vấn database trong hàm autoGenerate

const getAllQuestions = async () => {
  const questions = await questionRepository.findAllQuestions();

  return {
    success: true,
    statusCode: 200,
    message: "Lay danh sach cau hoi thanh cong!",
    data: questions,
  };
};

const getQuestionById = async (question_id) => {
  const question = await questionRepository.findQuestionById(question_id);

  if (!question) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay cau hoi!",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: question,
  };
};

const getQuestionsByVocabularyId = async (vocabulary_id) => {
  const questions = await questionRepository.findQuestionsByVocabularyId(
    vocabulary_id
  );

  return {
    success: true,
    statusCode: 200,
    message: "Lay cau hoi theo tu vung thanh cong!",
    data: questions,
  };
};

const createQuestion = async (data) => {
  const newQuestion = await questionRepository.createQuestion(data);

  return {
    success: true,
    statusCode: 201,
    message: "Them cau hoi thanh cong!",
    data: newQuestion,
  };
};

const updateQuestion = async (question_id, data) => {
  const question = await questionRepository.findQuestionById(question_id);

  if (!question) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay cau hoi!",
    };
  }

  const updatedQuestion = await questionRepository.updateQuestion(
    question_id,
    data
  );

  return {
    success: true,
    statusCode: 200,
    message: "Cap nhat cau hoi thanh cong!",
    data: updatedQuestion,
  };
};

const deleteQuestion = async (question_id) => {
  const question = await questionRepository.findQuestionById(question_id);

  if (!question) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay cau hoi!",
    };
  }

  await questionRepository.deleteQuestion(question_id);

  return {
    success: true,
    statusCode: 200,
    message: "Xoa cau hoi thanh cong!",
  };
};

// Thêm 2 hàm hỗ trợ trộn mảng ở trên cùng
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);
const getRandomItems = (array, num) => shuffleArray(array).slice(0, num);

// Hàm chính sinh câu hỏi (Đã thêm tham số generate_type)
const autoGenerateQuestions = async (lesson_id, generate_type = "both") => {
  const lessonIdNum = Number(lesson_id);

  // Lấy tất cả từ vựng để làm kho đáp án sai
  const allVocabs = await prisma.vocabularies.findMany({
    select: { vocabulary_id: true, vietnamese_meaning: true, lesson_id: true, word: true }
  });

  const lessonVocabs = allVocabs.filter(v => v.lesson_id === lessonIdNum);
  const otherVocabs = allVocabs.filter(v => v.lesson_id !== lessonIdNum);

  if (lessonVocabs.length === 0) throw new Error("Bài học này chưa có từ vựng nào!");

  const questionsToInsert = [];

  for (const vocab of lessonVocabs) {
    // 1. Chỉ sinh câu Tự luận nếu người dùng chọn 'typing' hoặc 'both'
    if (generate_type === "typing" || generate_type === "both") {
      questionsToInsert.push({
        vocabulary_id: vocab.vocabulary_id,
        content: `${vocab.word} có nghĩa là gì?`,
        question_type: "typing",
        correct_answer: vocab.vietnamese_meaning,
        options: null
      });
    }

    // 2. Chỉ sinh câu Trắc nghiệm nếu người dùng chọn 'multiple_choice' hoặc 'both'
    if (generate_type === "multiple_choice" || generate_type === "both") {
      const wrongVocabsInLesson = lessonVocabs.filter(v => v.vocabulary_id !== vocab.vocabulary_id);
      let wrongAnswers = wrongVocabsInLesson.map(v => v.vietnamese_meaning);

      // Nếu bài học ít hơn 4 từ, lấy mượn đáp án sai từ bài khác đắp vào
      if (wrongAnswers.length < 3) {
        const missingCount = 3 - wrongAnswers.length;
        const extraWrongs = getRandomItems(otherVocabs, missingCount).map(v => v.vietnamese_meaning);
        wrongAnswers = [...wrongAnswers, ...extraWrongs];
      } else {
        wrongAnswers = getRandomItems(wrongAnswers, 3);
      }

      const finalOptions = shuffleArray([vocab.vietnamese_meaning, ...wrongAnswers]);

      questionsToInsert.push({
        vocabulary_id: vocab.vocabulary_id,
        content: `Chọn nghĩa đúng của từ: ${vocab.word}`,
        question_type: "multiple_choice",
        correct_answer: vocab.vietnamese_meaning,
        options: finalOptions // Lưu vào DB dưới dạng JSON
      });
    }
  }

  const result = await prisma.questions.createMany({
    data: questionsToInsert,
    skipDuplicates: true,
  });

  return { success: true, statusCode: 201, message: `Tạo thành công ${result.count} câu hỏi tự động!` };
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  getQuestionsByVocabularyId,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  autoGenerateQuestions,
  shuffleArray,
  getRandomItems,
};