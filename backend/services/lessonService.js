const lessonRepository = require("../repositories/lessonRepository");
const prisma = require("../config/prisma");

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

// XÓA SẠCH DỮ LIỆU CON TRƯỚC KHI XÓA BÀI HỌC
const deleteLesson = async (lesson_id) => {
  const lessonIdNum = Number(lesson_id);

  // Kiểm tra xem bài học có tồn tại không
  const existingLesson = await lessonRepository.findLessonById(lessonIdNum);

  if (!existingLesson) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay bai hoc!",
    };
  }

  // 1. Lấy danh sách ID từ vựng thuộc bài học này
  const vocabs = await prisma.vocabularies.findMany({
    where: { lesson_id: lessonIdNum },
    select: { vocabulary_id: true }
  });
  const vocabIds = vocabs.map(v => v.vocabulary_id);

  // 2. Lấy danh sách ID câu hỏi thuộc các từ vựng trên
  let questionIds = [];
  if (vocabIds.length > 0) {
    const questions = await prisma.questions.findMany({
      where: { vocabulary_id: { in: vocabIds } },
      select: { question_id: true }
    });
    questionIds = questions.map(q => q.question_id);
  }

  // 3. Thực hiện xóa theo thứ tự từ dưới lên trên bằng Transaction (Chống lỗi khóa ngoại)
  await prisma.$transaction([
    // - Xóa lịch sử làm bài (Con của Câu hỏi)
    prisma.question_results.deleteMany({ where: { question_id: { in: questionIds } } }),
    
    // - Xóa Câu hỏi (Con của Từ vựng)
    prisma.questions.deleteMany({ where: { vocabulary_id: { in: vocabIds } } }),
    
    // - Xóa Tiến độ học SRS & Từ yêu thích (Con của Từ vựng)
    prisma.vocabulary_progress.deleteMany({ where: { vocabulary_id: { in: vocabIds } } }),
    prisma.favorite_vocabularies.deleteMany({ where: { vocabulary_id: { in: vocabIds } } }),
    
    // - Xóa Từ vựng (Con của Bài học)
    prisma.vocabularies.deleteMany({ where: { lesson_id: lessonIdNum } }),
    
    // - Cuối cùng mới Xóa Bài học
    prisma.lessons.delete({ where: { lesson_id: lessonIdNum } })
  ]);

  return {
    success: true,
    statusCode: 200,
    message: "Xoa bai hoc va du lieu lien quan thanh cong!",
  };
};

module.exports = {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};