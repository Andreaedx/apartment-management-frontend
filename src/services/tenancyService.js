import api from "./api";

export const getTenancies = async (params = {}) => {
  return api.get("/api/tenancies", {
    params,
  });
};

export const getTenancyById = async (id) => {
  return api.get(`/api/tenancies/${id}`);
};

export const createTenancy = async (data) => {
  return api.post("/api/tenancies", data);
};

export const updateTenancy = async (id, data) => {
  return api.patch(`/api/tenancies/${id}`, data);
};

export const endTenancy = async (id, data = {}) => {
  return api.patch(`/api/tenancies/${id}/end`, data);
};

export const getCurrentApartmentTenancy = async (apartmentId) => {
  return api.get(`/api/tenancies/apartment/${apartmentId}/current`);
};