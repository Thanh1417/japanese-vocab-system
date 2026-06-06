import axiosClient from "./axiosClient";

export const getQuizQuestionsApi = () => {
  return axiosClient.get("/questions");
};

export const startStudySessionApi = () => {
  return axiosClient.post("/study-sessions/start", {
    session_type: "quiz",
  });
};

export const endStudySessionApi = (sessionId, data) => {
  return axiosClient.put(`/study-sessions/${sessionId}/end`, data);
};

export const createQuestionResultApi = (data) => {
  return axiosClient.post("/question-results", data);
};