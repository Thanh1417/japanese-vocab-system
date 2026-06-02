import axiosClient from "./axiosClient";

export const getAllLessonsApi = () => {
  return axiosClient.get("/lessons");
};