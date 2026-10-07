import api from "./api";

export const register = async (data) => {
  return api.post("/api/auth/register", data);
};

export const verifyEmail = async (token) => {
  return api.get(`/api/auth/verify-email/${token}`);
};

export const login = async (data) => {
  return api.post("/api/auth/login", data);
};

export const logout = async () => {
  return api.post("/api/auth/logout");
};

export const refreshToken = async () => {
  return api.post("/api/auth/refresh");
};

export const forgotPassword = async (email) => {
  return api.post("/api/auth/forgot-password", {
    email,
  });
};

export const resetPassword = async (
  token,
  newPassword
) => {
  return api.post(
    `/api/auth/reset-password/${token}`,
    {
      newPassword,
    }
  );
};