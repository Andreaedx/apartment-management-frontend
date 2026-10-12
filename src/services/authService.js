import api from "./api";

export const register = async (data) => {
  return api.post("/api/auth/register", data);
};

// Verify with the 6-digit code from the registration email
export const verifyEmail = async (email, code) => {
  return api.post("/api/auth/verify-email", { email, code });
};

export const resendVerification = async (email) => {
  return api.post("/api/auth/resend-verification", { email });
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