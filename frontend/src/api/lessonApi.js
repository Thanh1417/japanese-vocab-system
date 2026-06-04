import axiosClient from "./axiosClient";

export const getAllLessonsApi = () => {
  return axiosClient.get("/lessons");
};

export const createLessonApi = (data) => {
  return axiosClient.post("/lessons", data);
};

export const updateLessonApi = (lessonId, data) => {
  return axiosClient.put(`/lessons/${lessonId}`, data);
};

export const deleteLessonApi = (lessonId) => {
  return axiosClient.delete(`/lessons/${lessonId}`);
};