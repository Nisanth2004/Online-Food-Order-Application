import api from "./CustomAxiosInstance";

// ADMIN
export const getCoupons = () =>
  api.get("/api/admin/coupons");

export const getCouponById = (id) =>
  api.get(`/api/admin/coupons/${id}`);

export const createCoupon = (data) =>
  api.post("/api/admin/coupons", data);

export const updateCoupon = (id, data) =>
  api.put(`/api/admin/coupons/${id}`, data);

export const deleteCoupon = (id) =>
  api.delete(`/api/admin/coupons/${id}`);

// PUBLIC
export const getActiveCoupons = () =>
  api.get("/api/admin/coupons/active");
