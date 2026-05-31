const prisma = require("../config/prisma");

// Tìm tiến độ học của 1 user với 1 từ vựng
const findProgress = async (account_id, vocabulary_id) => {
  return await prisma.vocabulary_progress.findUnique({
    where: {
      account_id_vocabulary_id: {
        account_id: Number(account_id),
        vocabulary_id: Number(vocabulary_id),
      },
    },
  });
};

// Tạo tiến độ học mới
const createProgress = async (data) => {
  return await prisma.vocabulary_progress.create({
    data,
  });
};

// Cập nhật tiến độ học
const updateProgress = async (progress_id, data) => {
  return await prisma.vocabulary_progress.update({
    where: {
      progress_id: Number(progress_id),
    },
    data,
  });
};

// Lấy danh sách từ cần ôn hôm nay
const getDueVocabularies = async (account_id) => {
  return await prisma.vocabulary_progress.findMany({
    where: {
      account_id: Number(account_id),
      next_review_at: {
        lte: new Date(),
      },
    },
    include: {
      vocabulary: {
        include: {
          lesson: true,
        },
      },
    },
    orderBy: {
      next_review_at: "asc",
    },
  });
};

module.exports = {
  findProgress,
  createProgress,
  updateProgress,
  getDueVocabularies,
};