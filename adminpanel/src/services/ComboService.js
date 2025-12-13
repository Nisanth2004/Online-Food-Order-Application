import api from "./CustomAxiosInstance";

export const getAllCombos = () =>
  api.get("/api/admin/combos");

export const getActiveCombos = () =>
  api.get("/api/admin/combos/active");

export const createCombo = (data) =>
  api.post("/api/admin/combos", data);

export const updateCombo = (id, data) =>
  api.put(`/api/admin/combos/${id}`, data);

export const deleteCombo = (id) =>
  api.delete(`/api/admin/combos/${id}`);

export const getComboById = (id) =>
  api.get(`/api/admin/combos/${id}`);
