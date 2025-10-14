import api from "./CustomAxiosInstance";

export const addToCart = async (foodId, token) => {
  try {
    await api.post(
      "/api/cart",
      { foodId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error while adding to cart", error);
  }
};

export const removeQtyFromCart = async (foodId, token) => {
  try {
    await api.post(
      "/api/cart/remove",
      { foodId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error while removing cart quantity", error);
  }
};

export const getCartData = async (token) => {
  if (!token) {
    console.error("Missing token, cannot fetch cart data");
    return;
  }

  try {
    const response = await api.get("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.items;
  } catch (error) {
    console.error(
      "Error while fetching cart data:",
      error.response ? error.response.data : error
    );
  }
};
