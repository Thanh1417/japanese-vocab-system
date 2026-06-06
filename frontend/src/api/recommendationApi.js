import axiosClient from "./axiosClient";

export const getRecommendationsApi = () => {
  return axiosClient.get("/recommendations");
};