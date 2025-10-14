import api from "./CustomAxiosInstance";

// ✅ Fetch all foods (paginated)
export const fetchFoodList = async (page = 0, size = 16) => {
  try {
    const response = await api.get("/api/foods", {
      params: { page, size },
    });
    // Expected structure: { foods: [...], currentPage, totalPages, totalItems }
    return response.data;
  } catch (error) {
    console.error("Error fetching food list", error);
    throw error;
  }
};

// ✅ Fetch single food details
export const fetchFoodDetails = async (id) => {
  try {
    const response = await api.get(`/api/foods/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching food details", error);
    throw error;
  }
};
