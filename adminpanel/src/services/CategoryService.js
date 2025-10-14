import api from "./CustomAxiosInstance";


const CATEGORY_API = "/api/categories";

export const fetchCategories = async () => {
  return api.get(CATEGORY_API);
};

export const addCategory = async (category) => {
  return api.post(CATEGORY_API, category);
};

export const deleteCategory = async (id) => {
  return api.delete(`${CATEGORY_API}/${id}`);
};
