// ---------------- ANALYTICS APIs (FIXED) ----------------
import api from "./CustomAxiosInstance";



export const getMonthlySales = async () => {
  const resp = await api.get("/api/analytics/sales/monthly");
  return resp.data;
};

export const getMonthlyStockHistory = async () => {
  const resp = await api.get("/api/analytics/stock/history/monthly");
  return resp.data;
};

export const getTopSellingFoods = async () => {
  const resp = await api.get("/api/analytics/top-selling");
  return resp.data;
};

export const getLowStockFoods = async () => {
  const resp = await api.get("/api/analytics/low-stock");
  return resp.data;
};
