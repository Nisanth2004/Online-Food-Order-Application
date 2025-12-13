import api from "./CustomAxiosInstance";

export const getFlashSales = () =>
  api.get("/api/admin/flash-sales");

export const getActiveFlashSales = () =>
  api.get("/api/admin/flash-sales/active");

export const createFlashSale = (data) =>
  api.post("/api/admin/flash-sales", data);

export const deleteFlashSale = (id) =>
  api.delete(`/api/admin/flash-sales/${id}`);
