// src/services/FoodService.js
import api from "./CustomAxiosInstance";

const FOOD_API = "/api/foods";

export const addFood = async (foodData, image) => {
  const formData = new FormData();
  formData.append("food", JSON.stringify(foodData));
  if (image) formData.append("file", image);

  const res = await api.post(FOOD_API, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ✅ Updated function with pagination support
export const getFoodList = async (page = 0, size = 15) => {
  const response = await api.get(FOOD_API, {
    params: { page, size },
  });
  return response.data; // contains { foods, currentPage, totalPages, totalItems }
};

export const deleteFood = async (id) => {
  const response = await api.delete(`${FOOD_API}/${id}`);
  return response.status === 204;
};
