import axiosClient from "./axiosClient";

export const getQuizQuestionsApi = () => {
  return axiosClient.get("/questions");
};

export const startStudySessionApi = (data) => {
  return axiosClient.post("/study-sessions/start", data); 
};

export const endStudySessionApi = (sessionId, data) => {
  return axiosClient.put(`/study-sessions/${sessionId}/end`, data);
};

export const createQuestionResultApi = (data) => {
  return axiosClient.post("/question-results", data);
};