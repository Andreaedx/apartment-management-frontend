import api from "./api";

export const createPayment = async (data) => {
  return api.post("/api/payments", data);
};

export const getPayments = async () => {
  return api.get("/api/payments");
};

export const getPaymentById = async (id) => {
  return api.get(`/api/payments/${id}`);
};