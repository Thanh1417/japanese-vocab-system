const vocabularyProgressRepository = require("../repositories/vocabularyProgressRepository");
const prisma = require("../config/prisma");

// THUẬT TOÁN SM-2 
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
  const MAX_INTERVAL_DAYS = 3650; // Tối đa 10 năm, tránh overflow datetime MySQL
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
    // Giới hạn interval_days tối đa 10 năm
    if (interval_days > MAX_INTERVAL_DAYS) interval_days = MAX_INTERVAL_DAYS;
  }

  // 3. Tính lại hệ số dễ (Ease Factor)
  ease_factor = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ease_factor < 1.3) ease_factor = 1.3; // Tối thiểu là 1.3

  const next_review_at = new Date();
  next_review_at.setDate(next_review_at.getDate() + interval_days);

  // MySQL DATETIME tối đa là 9999-12-31 — giới hạn an toàn
  const MAX_MYSQL_DATE = new Date('9999-12-31T00:00:00.000Z');
  const safe_next_review_at = next_review_at > MAX_MYSQL_DATE ? MAX_MYSQL_DATE : next_review_at;

  return {
    repetition_count,
    ease_factor,
    interval_days,
    last_reviewed_at: new Date(),
    next_review_at: safe_next_review_at,
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
  //  CẬP NHẬT THUẬT TOÁN SRS
  const progress = await updateVocabularyProgress(account_id, vocabulary_id, rating);

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