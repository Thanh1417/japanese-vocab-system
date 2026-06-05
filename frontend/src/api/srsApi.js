import axiosClient from "./axiosClient";

export const getDueSrsVocabulariesApi = () => {
  return axiosClient.get("/srs/due");
};

export const submitSrsReviewApi = (data) => {
  return axiosClient.post("/srs/review", data);
};