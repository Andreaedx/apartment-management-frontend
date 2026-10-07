import api from "./api";

export const getProperties = async () => {
  return api.get("/properties");
};

export const getPropertyById = async (id) => {
  return api.get(`/properties/${id}`);
};

export const createProperty = async (formData) => {
  return api.post("/properties", formData);
};

export const updateProperty = async (id, data) => {
  return api.put(`/properties/${id}`, data);
};

export const deleteProperty = async (id) => {
  return api.delete(`/properties/${id}`);
};

export const deletePropertyImage = async (
  propertyId,
  imageId
) => {
  return api.delete(
    `/properties/${propertyId}/images/${imageId}`
  );
};

export const replacePropertyImage = async (
  propertyId,
  imageId,
  formData
) => {
  return api.put(
    `/properties/${propertyId}/images/${imageId}`,
    formData
  );
};