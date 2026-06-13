import axiosClient from "./axiosClient";

export const getDashboardOverviewApi = (range = 30) => {
  return axiosClient.get(`/dashboard/overview?range=${range}`);
};