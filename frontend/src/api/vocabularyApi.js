import axiosClient from "./axiosClient";

export const getAllVocabulariesApi = () => {
  return axiosClient.get("/vocabularies");
};

export const createVocabularyApi = (data) => {
  return axiosClient.post("/vocabularies", data);
};

export const updateVocabularyApi = (vocabularyId, data) => {
  return axiosClient.put(`/vocabularies/${vocabularyId}`, data);
};

export const deleteVocabularyApi = (vocabularyId) => {
  return axiosClient.delete(`/vocabularies/${vocabularyId}`);
};

export const getFlashcardVocabulariesApi = () => {
  return axiosClient.get("/vocabularies");
};

export const searchVocabularyApi = (keyword) => {
  return axiosClient.get(`/vocabularies/search?keyword=${keyword}`);
};