import axiosClient from "./axiosClient";

export const addFavoriteVocabularyApi = (vocabularyId) => {
  return axiosClient.post(`/favorites/${vocabularyId}`);
};