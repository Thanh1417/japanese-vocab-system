import axiosClient from "./axiosClient";

export const getMyStudySessionsApi = () => {
  return axiosClient.get("/study-sessions/my");
};

export const getStudySessionDetailApi = (sessionId) => {
  return axiosClient.get(`/study-sessions/${sessionId}`);
};

export const getQuestionResultsBySessionApi = (sessionId) => {
  return axiosClient.get(`/question-results/session/${sessionId}`);
};