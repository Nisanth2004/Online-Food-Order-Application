import api from "./CustomAxiosInstance";

// ADMIN
export const getCoupons = () =>
  api.get("/api/admin/coupons");

export const getCouponById = (id) =>
  api.get(`/api/admin/coupons/${id}`);

export const createCoupon = (formData) =>
  api.post("/api/admin/coupons", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const updateCoupon = (id, formData) =>
  api.put(`/api/admin/coupons/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const deleteCoupon = (id) =>
  api.delete(`/api/admin/coupons/${id}`);

// PUBLIC
export const getActiveCoupons = () =>
  api.get("/api/admin/coupons/active");
