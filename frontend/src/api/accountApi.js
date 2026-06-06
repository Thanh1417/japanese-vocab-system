import axiosClient from "./axiosClient";

export const getAllAccountsApi = () => {
  return axiosClient.get("/accounts");
};

export const updateAccountApi = (accountId, data) => {
  return axiosClient.put(`/accounts/${accountId}`, data);
};

export const deleteAccountApi = (accountId) => {
  return axiosClient.delete(`/accounts/${accountId}`);
};