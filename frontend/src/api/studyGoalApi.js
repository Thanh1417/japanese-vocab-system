import axiosClient from "./axiosClient";

export const getMyStudyGoalsApi = () => {
  return axiosClient.get("/study-goals");
};

export const getActiveStudyGoalApi = () => {
  return axiosClient.get("/study-goals/active");
};

export const createStudyGoalApi = (data) => {
  return axiosClient.post("/study-goals", data);
};

export const updateStudyGoalApi = (goalId, data) => {
  return axiosClient.put(`/study-goals/${goalId}`, data);
};

export const deleteStudyGoalApi = (goalId) => {
  return axiosClient.delete(`/study-goals/${goalId}`);
};

export const getGoalDailyPlanApi = (goalId) => {
  return axiosClient.get(`/study-goals/${goalId}/daily-plan`);
};

export const getGoalDayDetailApi = (goalId, dayNumber) => {
  return axiosClient.get(`/study-goals/${goalId}/day/${dayNumber}`);
};