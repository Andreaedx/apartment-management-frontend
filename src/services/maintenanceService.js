import api from "./api";

export const createMaintenanceRequest = async (data) => {
  return api.post("/api/maintenances", data);
};

export const getMaintenanceRequests = async () => {
  return api.get("/api/maintenances");
};

export const getMaintenanceRequestById = async (id) => {
  return api.get(`/api/maintenances/${id}`);
};

export const updateMaintenanceRequest = async (id, data) => {
  return api.patch(`/api/maintenances/${id}`, data);
};

export const updateMaintenanceStatus = async (id, status) => {
  return api.patch(`/api/maintenances/${id}/status`, {
    status,
  });
};