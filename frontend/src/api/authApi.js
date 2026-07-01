import axiosClient from "./axiosClient";

export const loginApi = (data) => {
  return axiosClient.post("/auth/login", data);
};

export const loginGoogleApi = (credential) => {
  return axiosClient.post("/auth/google-login", {
    credential,
  });
};

export const registerApi = (data) => {
  return axiosClient.post("/auth/register", data);
};