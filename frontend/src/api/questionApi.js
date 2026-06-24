import axiosClient from "./axiosClient";

export const getAllQuestionsApi = () => {
  return axiosClient.get("/questions");
};

export const createQuestionApi = (data) => {
  return axiosClient.post("/questions", data);
};

export const updateQuestionApi = (questionId, data) => {
  return axiosClient.put(`/questions/${questionId}`, data);
};

export const deleteQuestionApi = (questionId) => {
  return axiosClient.delete(`/questions/${questionId}`);
};

export const autoGenerateQuestionsApi = async (lessonId, data) => {
  return await axiosClient.post(`/questions/auto-generate/${lessonId}`, data);
};