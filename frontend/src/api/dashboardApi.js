import axiosClient from "./axiosClient";

export const getDashboardOverviewApi = () => {
  return axiosClient.get("/dashboard/overview");
};