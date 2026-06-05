import axiosClient from "./axiosClient";

export const getMyFavoritesApi = () => {
  return axiosClient.get("/favorites");
};

export const addFavoriteVocabularyApi = (vocabularyId) => {
  return axiosClient.post(`/favorites/${vocabularyId}`);
};

export const removeFavoriteVocabularyApi = (vocabularyId) => {
  return axiosClient.delete(`/favorites/${vocabularyId}`);
};