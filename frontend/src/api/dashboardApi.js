import axiosClient from "./axiosClient";

export const getDashboardOverviewApi = (range = 30) => {
  return axiosClient.get(`/dashboard/overview?range=${range}`);
};

// API cho Admin
export const getAdminDashboardOverviewApi = (range = 30) => {
  return axiosClient.get(`/dashboard/admin/overview?range=${range}`);
};