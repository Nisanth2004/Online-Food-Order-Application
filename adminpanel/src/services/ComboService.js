import api from "./CustomAxiosInstance";

// ADMIN
export const getAllCombos = () =>
  api.get("/api/admin/combos");

export const getComboById = (id) =>
  api.get(`/api/admin/combos/${id}`);

export const createCombo = (formData) =>
  api.post("/api/admin/combos", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const updateCombo = (id, formData) =>
  api.put(`/api/admin/combos/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const deleteCombo = (id) =>
  api.delete(`/api/admin/combos/${id}`);

// PUBLIC
export const getActiveCombos = () =>
  api.get("/api/admin/combos/active");
