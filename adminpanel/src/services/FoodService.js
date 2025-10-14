import api from "./CustomAxiosInstance";


const FOOD_API = "/api/foods";

export const addFood = async (foodData, image) => {
  const formData = new FormData();
  formData.append("food", JSON.stringify(foodData));
  if (image) formData.append("file", image);

  // Let axios set Content-Type automatically
  const res = await api.post(FOOD_API, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getFoodList = async () => {
  const response = await api.get(FOOD_API);
  return response.data;
};

export const deleteFood = async (id) => {
  const response = await api.delete(`${FOOD_API}/${id}`);
  return response.status === 204;
};
