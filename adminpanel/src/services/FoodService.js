import axios from "axios";

const API_URL = "http://localhost:8080/api/foods";

// foodData is a plain object (name, description, price, category, sponsored, featured, ...)
export const addFood = async (foodData, image) => {
  const formData = new FormData();
  formData.append("food", JSON.stringify(foodData));
  if (image) formData.append("file", image);

  // Let axios set the multipart/form-data boundary header automatically
  const res = await axios.post(API_URL, formData);
  return res.data;
};

export const getFoodList = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (err) {
    console.error("Error fetching food list", err);
    throw err;
  }
};

export const deleteFood = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.status === 204; // backend returns 204 NO_CONTENT
  } catch (err) {
    console.error("Error deleting food", err);
    throw err;
  }
};
