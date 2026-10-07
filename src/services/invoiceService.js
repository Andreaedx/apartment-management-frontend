import api from "./api";

export const createInvoice = async (data) => {
  return api.post("/api/invoices", data);
};

export const getInvoices = async () => {
  return api.get("/api/invoices");
};

export const getInvoiceById = async (id) => {
  return api.get(`/api/invoices/${id}`);
};