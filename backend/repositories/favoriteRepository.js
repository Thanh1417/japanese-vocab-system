const prisma = require("../config/prisma");

const findFavorite = async (account_id, vocabulary_id) => {
  return await prisma.favorite_vocabularies.findUnique({
    where: {
      account_id_vocabulary_id: {
        account_id: Number(account_id),
        vocabulary_id: Number(vocabulary_id),
      },
    },
  });
};

const createFavorite = async (account_id, vocabulary_id) => {
  return await prisma.favorite_vocabularies.create({
    data: {
      account_id: Number(account_id),
      vocabulary_id: Number(vocabulary_id),
    },
  });
};

const findFavoritesByAccountId = async (account_id) => {
  return await prisma.favorite_vocabularies.findMany({
    where: {
      account_id: Number(account_id),
    },
    include: {
      vocabulary: {
        include: {
          lesson: true,
        },
      },
    },
    orderBy: {
      added_date: "desc",
    },
  });
};

const deleteFavorite = async (account_id, vocabulary_id) => {
  return await prisma.favorite_vocabularies.delete({
    where: {
      account_id_vocabulary_id: {
        account_id: Number(account_id),
        vocabulary_id: Number(vocabulary_id),
      },
    },
  });
};

module.exports = {
  findFavorite,
  createFavorite,
  findFavoritesByAccountId,
  deleteFavorite,
};