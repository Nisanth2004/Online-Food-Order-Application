import api from "./CustomAxiosInstance";

// ✅ Fetch all foods (paginated)
export const fetchFoodList = async (
  page = 0,
  size = 16,
  category = "All",
  search = "",
  sort = ""
) => {
  const params = {};

  params.page = page;
  params.size = size;

  if (category !== "All") params.category = category;
  if (search.trim() !== "") params.search = search;
  if (sort.trim() !== "") params.sort = sort;

  const response = await api.get("/api/foods", { params });
  return response.data;
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



export const fetchBestSellers = async () => {
  const res = await api.get("/api/foods/best-sellers");
  return res.data;
};

export const fetchTopSelling = async () => {
  const res = await api.get("/api/foods/top-selling");
  return res.data;
};

export const fetchFeaturedFoods = async () => {
  const res = await api.get("/api/foods/featured");
  return res.data;
};