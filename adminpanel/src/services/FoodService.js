import api from "./CustomAxiosInstance";

const FOOD_API = "/api/foods";

import axios from "axios";
// Add new food with image
export const addFood = async (foodData, image) => {
  const formData = new FormData();
  formData.append("food", JSON.stringify(foodData));
  if (image) formData.append("file", image);

  const response = await api.post(FOOD_API, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateFood = async (id, foodData, image) => {
  const formData = new FormData();
  formData.append("food", JSON.stringify(foodData));
  if (image) formData.append("file", image);

  const response = await api.put(`/api/foods/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Get food list with pagination (keeps existing signature)
export const getFoodList = async (page = 0, size = 15, category, search, sort) => {
  const params = { page, size };
  if (category) params.category = category;
  if (search) params.search = search;
  if (sort) params.sort = sort;
  const response = await api.get(FOOD_API, { params });
  return response.data;
};

// Get single food
export const getFood = async (id) => {
  const response = await api.get(`${FOOD_API}/${id}`);
  return response.data;
};

// Delete a food by ID
export const deleteFood = async (id) => {
  const response = await api.delete(`${FOOD_API}/${id}`);
  return response.status === 204 || response.status === 200;
};

export const getCategories = async () => {
  const resp = await api.get("/api/categories");
  return resp.data;
};
export const getStockLogs = async () => {
  return axios
    .get("http://localhost:8080/api/analytics/stock/logs")
    .then((res) => res.data)
    .catch((err) => {
      console.error("Error fetching logs:", err);
      return [];
    });
};




// ------------- NEW STOCK APIs --------------

// Adjust stock by delta (positive to increase, negative to decrease)
export const adjustStock = async (foodId, delta) => {
  // PATCH /api/foods/{id}/stock?delta=-3
  const response = await api.patch(`${FOOD_API}/${foodId}/stock`, null, {
    params: { delta },
  });
  return response.data;
};

// Set stock to absolute value
export const setStock = async (foodId, value) => {
  // PUT /api/foods/{id}/stock?value=10
  const response = await api.put(`${FOOD_API}/${foodId}/stock`, null, {
    params: { value },
  });
  return response.data;
};

export default {
  addFood,
  getFoodList,
  getFood,
  deleteFood,
  adjustStock,
  setStock,
};
