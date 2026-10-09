import api from "./api";

export const getApartments = async (params = {}) => {
  return api.get("/api/apartments", {
    params,
  });
};

export const getApartmentById = async (id) => {
  return api.get(`/api/apartments/${id}`);
};

export const createApartment = async (formData) => {
  return api.post("/api/apartments", formData);
};

export const updateApartment = async (id, data) => {
  return api.patch(`/api/apartments/${id}`, data);
};

export const deleteApartment = async (id) => {
  return api.delete(`/api/apartments/${id}`);
};

// formData with one or more "images" files
export const addApartmentImages = async (id, formData) => {
  return api.post(`/api/apartments/${id}/images`, formData);
};

export const deleteApartmentImage = async (
  apartmentId,
  imageId
) => {
  return api.delete(
    `/api/apartments/${apartmentId}/images/${imageId}`
  );
};

export const replaceApartmentImage = async (
  apartmentId,
  imageId,
  formData
) => {
  return api.put(
    `/api/apartments/${apartmentId}/images/${imageId}`,
    formData
  );
};