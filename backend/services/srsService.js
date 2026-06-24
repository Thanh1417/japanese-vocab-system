const vocabularyProgressRepository = require("../repositories/vocabularyProgressRepository");
const prisma = require("../config/prisma");

// THUẬT TOÁN SM-2 CHUẨN MỰC
const calculateNextReview = (progress, rating) => {
  let repetition_count = progress?.repetition_count || 0;
  let ease_factor = progress?.ease_factor || 2.5;
  let interval_days = progress?.interval_days || 1;

  // 1. Quy đổi rating sang điểm chất lượng (q)
  let q = 4; // Mặc định là Good
  if (rating === 'again') q = 1;
  else if (rating === 'hard') q = 3;
  else if (rating === 'good') q = 4;
  else if (rating === 'easy') q = 5;

  // 2. Tính số lần lặp và khoảng cách ngày
  if (q < 3) {
    // Nếu Quên (Again) -> Reset chuỗi
    repetition_count = 0;
    interval_days = 1;
  } else {
    // Nếu Nhớ (Hard, Good, Easy) -> Tăng chuỗi
    repetition_count += 1;
    if (repetition_count === 1) interval_days = 1;
    else if (repetition_count === 2) interval_days = 6;
    else {
      interval_days = Math.round(interval_days * ease_factor);
    }
  }

  // 3. Tính lại hệ số dễ (Ease Factor)
  ease_factor = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ease_factor < 1.3) ease_factor = 1.3; // Tối thiểu là 1.3

  const next_review_at = new Date();
  next_review_at.setDate(next_review_at.getDate() + interval_days);

  return {
    repetition_count,
    ease_factor,
    interval_days,
    last_reviewed_at: new Date(),
    next_review_at,
  };
};

const updateVocabularyProgress = async (account_id, vocabulary_id, rating) => {
  const existingProgress = await vocabularyProgressRepository.findProgress(account_id, vocabulary_id);
  const newProgressData = calculateNextReview(existingProgress, rating);

  if (!existingProgress) {
    return await vocabularyProgressRepository.createProgress({
      account_id: Number(account_id),
      vocabulary_id: Number(vocabulary_id),
      ...newProgressData,
    });
  }

  return await vocabularyProgressRepository.updateProgress(
    existingProgress.progress_id,
    newProgressData
  );
};

const reviewVocabulary = async (account_id, vocabulary_id, rating, session_id) => {
  // 1. CẬP NHẬT TIẾN ĐỘ SRS
  const progress = await updateVocabularyProgress(account_id, vocabulary_id, rating);

  // 2. LƯU LỊCH SỬ VÀO BẢNG QUESTION_RESULTS
  if (session_id) {
    const currentSession = await prisma.study_sessions.findUnique({
      where: { session_id: Number(session_id) }
    });

    if (currentSession && currentSession.session_type === 'flashcard') {
      // FLASHCARD: Tạo mới dòng lịch sử, dùng cột vocabulary_id mới thêm
      const is_correct = rating === 'good' || rating === 'easy';
      await prisma.question_results.create({
        data: {
          session_id: Number(session_id),
          vocabulary_id: Number(vocabulary_id),
          rating: rating,
          is_correct: is_correct
        }
      });
    } else if (currentSession && currentSession.session_type !== 'flashcard') {
      // TRẮC NGHIỆM/TỰ LUẬN: Đã được tạo lúc người dùng click chọn đáp án. 
      // Ở đây chỉ cần Update lại cột `rating` dựa theo thời gian phản xạ.
      const sampleQuestion = await prisma.questions.findFirst({
        where: { vocabulary_id: Number(vocabulary_id), question_type: currentSession.session_type }
      });

      if (sampleQuestion) {
        await prisma.question_results.updateMany({
          where: {
            session_id: Number(session_id),
            question_id: sampleQuestion.question_id
          },
          data: {
            rating: rating
          }
        });
      }
    }
  }

  return {
    success: true,
    statusCode: 200,
    message: "Cập nhật tiến độ ôn tập SRS thành công!",
    data: progress,
  };
};

const getDueVocabularies = async (account_id) => {
  const vocabularies = await vocabularyProgressRepository.getDueVocabularies(account_id);
  return {
    success: true,
    statusCode: 200,
    message: "Lấy danh sách từ vựng cần ôn tập thành công!",
    data: vocabularies,
  };
};

module.exports = {
  calculateNextReview,
  updateVocabularyProgress,
  reviewVocabulary,
  getDueVocabularies,
};