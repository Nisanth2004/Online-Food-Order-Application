import api from "./CustomAxiosInstance";

export const fetchCategories = async () => {
  return await api.get("/api/categories");
};

export const addCategory = async (category) => {
  return await api.post("/api/categories", category);
};

export const deleteCategory = async (id) => {
  return await api.delete(`/api/categories/${id}`);
};
