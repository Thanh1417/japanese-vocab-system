const prisma = require("../config/prisma");

const createStudySession = async (data) => {
  return await prisma.study_sessions.create({
    data,
  });
};

const findStudySessionById = async (session_id) => {
  return await prisma.study_sessions.findUnique({
    where: {
      session_id: Number(session_id),
    },
  });
};

const updateStudySession = async (session_id, data) => {
  return await prisma.study_sessions.update({
    where: {
      session_id: Number(session_id),
    },
    data,
  });
};

module.exports = {
  createStudySession,
  findStudySessionById,
  updateStudySession,
};