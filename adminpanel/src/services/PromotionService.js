import api from "./CustomAxiosInstance";

// ================= ADMIN =================

// GET ALL PROMOTIONS
export const getPromotions = () =>
  api.get("/api/admin/promotions");

// GET PROMOTION BY ID
export const getPromotionById = (id) =>
  api.get(`/api/admin/promotions/${id}`);

// CREATE PROMOTION (multipart)
export const createPromotion = (formData) =>
  api.post("/api/admin/promotions", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

// UPDATE PROMOTION (multipart)
export const updatePromotion = (id, formData) =>
  api.put(`/api/admin/promotions/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

// DELETE PROMOTION
export const deletePromotion = (id) =>
  api.delete(`/api/admin/promotions/${id}`);


// ================= PUBLIC =================

// GET ACTIVE PROMOTIONS
export const getActivePromotions = () =>
  api.get("/api/admin/promotions/active");
