import axiosClient from "./axiosClient";

export const getQuizQuestionsApi = () => {
  return axiosClient.get("/questions");
};