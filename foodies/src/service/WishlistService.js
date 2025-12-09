import api from "./CustomAxiosInstance";

// Fetch wishlist for the logged-in user
export const fetchWishlist = async (userId, token) => {
  const res = await api.get(`/api/wishlist/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Add item to wishlist
export const addToWishlist = async (foodId, userId, token) => {
  const res = await api.post(`/api/wishlist/add/${foodId}?userId=${userId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Remove item from wishlist
export const removeFromWishlist = async (foodId, userId, token) => {
  const res = await api.delete(`/api/wishlist/remove/${foodId}?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
