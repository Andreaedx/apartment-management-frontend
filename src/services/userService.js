import api from "./api";

export const getProfile = async () => {
  return api.get("/api/users/profile");
};

export const uploadProfilePicture = async (formData) => {
  return api.post("/api/users/profile-picture", formData);
};

export const updateProfile = async (data) => {
  return api.patch("/api/users/profile", data);
};

export const changePassword = async (data) => {
  return api.patch("/api/users/password", data);
};

export const deleteAccount = async () => {
  return api.delete("/api/users/delete");
};

// Admin user management

// params: { page, limit } (limit max 100)
export const getUsers = async (params = {}) => {
  return api.get("/api/users", { params });
};

// Verified tenants (manager/admin), used when creating a tenancy
export const getTenants = async () => {
  return api.get("/api/users/tenants");
};

export const getUserById = async (id) => {
  return api.get(`/api/users/${id}`);
};

export const updateUser = async (id, data) => {
  return api.patch(`/api/users/${id}`, data);
};

export const deleteUser = async (id) => {
  return api.delete(`/api/users/${id}`);
};

// Admin manager-request review

export const getManagerRequests = async (status = "PENDING") => {
  return api.get("/api/users/manager-requests", {
    params: { status },
  });
};

export const reviewManagerRequest = async (id, action) => {
  return api.patch(`/api/users/${id}/manager-request`, {
    action,
  });
};