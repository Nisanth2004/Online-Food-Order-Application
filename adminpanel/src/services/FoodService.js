import api from "./CustomAxiosInstance";

const FOOD_API = "/api/foods";

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

// Get food list with pagination
export const getFoodList = async (page = 0, size = 15) => {
  const response = await api.get(FOOD_API, { params: { page, size } });
  return response.data;
};

// Delete a food by ID
export const deleteFood = async (id) => {
  const response = await api.delete(`${FOOD_API}/${id}`);
  return response.status === 204;
};
