const vocabularyProgressRepository = require("../repositories/vocabularyProgressRepository");

const calculateNextReview = (progress, isCorrect) => {
  let repetition_count = progress?.repetition_count || 0;
  let ease_factor = progress?.ease_factor || 2.5;
  let interval_days = progress?.interval_days || 1;

  if (isCorrect) {
    repetition_count += 1;

    if (repetition_count === 1) {
      interval_days = 1;
    } else if (repetition_count === 2) {
      interval_days = 3;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }

    ease_factor = ease_factor + 0.1;
  } else {
    repetition_count = 0;
    interval_days = 1;
    ease_factor = Math.max(1.3, ease_factor - 0.2);
  }

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

const updateVocabularyProgress = async (
  account_id,
  vocabulary_id,
  isCorrect
) => {
  const existingProgress =
    await vocabularyProgressRepository.findProgress(
      account_id,
      vocabulary_id
    );

  const newProgressData = calculateNextReview(
    existingProgress,
    isCorrect
  );

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

const reviewVocabulary = async (
  account_id,
  vocabulary_id,
  is_correct
) => {
  const progress = await updateVocabularyProgress(
    account_id,
    vocabulary_id,
    is_correct
  );

  return {
    success: true,
    statusCode: 200,
    message: "Cap nhat tien do on tap SRS thanh cong!",
    data: progress,
  };
};

const getDueVocabularies = async (account_id) => {
  const vocabularies =
    await vocabularyProgressRepository.getDueVocabularies(
      account_id
    );

  return {
    success: true,
    statusCode: 200,
    message: "Lay danh sach tu vung can on tap thanh cong!",
    data: vocabularies,
  };
};

module.exports = {
  calculateNextReview,
  updateVocabularyProgress,
  reviewVocabulary,
  getDueVocabularies,
};