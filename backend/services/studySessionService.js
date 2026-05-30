const studySessionRepository = require("../repositories/studySessionRepository");

const startStudySession = async (account_id, data) => {
  const newSession = await studySessionRepository.createStudySession({
    account_id: Number(account_id),
    session_type: data.session_type || "quiz",
  });

  return {
    success: true,
    statusCode: 201,
    message: "Bat dau phien hoc thanh cong!",
    data: newSession,
  };
};

const getStudySessionById = async (session_id) => {
  const session = await studySessionRepository.findStudySessionById(session_id);

  if (!session) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay phien hoc!",
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: session,
  };
};

const endStudySession = async (session_id, data) => {
  const session = await studySessionRepository.findStudySessionById(session_id);

  if (!session) {
    return {
      success: false,
      statusCode: 404,
      message: "Khong tim thay phien hoc!",
    };
  }

  const updatedSession = await studySessionRepository.updateStudySession(
    session_id,
    {
      end_time: new Date(),
      total_questions: Number(data.total_questions),
      correct_answers: Number(data.correct_answers),
    }
  );

  return {
    success: true,
    statusCode: 200,
    message: "Ket thuc phien hoc thanh cong!",
    data: updatedSession,
  };
};

module.exports = {
  startStudySession,
  getStudySessionById,
  endStudySession,
};