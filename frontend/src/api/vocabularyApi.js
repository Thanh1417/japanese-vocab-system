import axiosClient from "./axiosClient";

export const getAllVocabulariesApi = () => {
  return axiosClient.get("/vocabularies");
};