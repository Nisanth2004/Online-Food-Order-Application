import { createContext, useEffect, useState } from "react";
import { fetchFoodList } from "../service/FoodService";
import {
  addToWishlist as addToWishlistAPI,
  removeFromWishlist as removeFromWishlistAPI,
  fetchWishlist as fetchWishlistAPI
} from "../service/WishlistService";
import { addToCart, getCartData, removeQtyFromCart } from "../service/cartService";
import { getSettings } from "../service/settingService";
import { toast } from "react-hot-toast";
import jwt_decode from "jwt-decode"; // ✅ static import

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
  const [foodList, setFoodList] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [taxRate, setTaxRate] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [loadingUser, setLoadingUser] = useState(true);

  const increaseQty = async (foodId) => {
    const food = foodList.find(f => f.id === foodId);
    if (!food) return;
    const currentQty = quantities[foodId] || 0;
    if (currentQty >= food.stock) {
      toast.warning(`Only ${food.stock} stock available`);
      return;
    }
    setQuantities(prev => ({ ...prev, [foodId]: currentQty + 1 }));
    await addToCart(foodId, token);
  };

  const decreaseQty = async (foodId) => {
    setQuantities(prev => ({ ...prev, [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0 }));
    await removeQtyFromCart(foodId, token);
  };

  const removeFromCart = (foodId) => {
    setQuantities(prev => { const updated = { ...prev }; delete updated[foodId]; return updated; });
  };

  const loadCartData = async (token) => {
    const items = await getCartData(token);
    setQuantities(items);
  };

  const addToWishlist = async (foodId) => {
    if (!user?.id) {
      toast.error("Login required");
      return;
    }
    try {
      await addToWishlistAPI(foodId, user.id, token);
      setWishlist(prev => [...prev, foodId]);
    } catch (err) {
      console.error("Add to wishlist failed", err);
      toast.error("Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (foodId) => {
    if (!user?.id) {
      toast.error("Login required");
      return;
    }
    try {
      await removeFromWishlistAPI(foodId, user.id, token);
      setWishlist(prev => prev.filter(id => id !== foodId));
    } catch (err) {
      console.error("Remove from wishlist failed", err);
      toast.error("Failed to remove from wishlist");
    }
  };

  // Update user state immediately after token is set
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }
    try {
      const decoded = jwt_decode(token);
      const userId = decoded.id || decoded.sub || decoded.userId || decoded.user_id || decoded.username || decoded.email;
      const username = decoded.username || decoded.email || decoded.sub || decoded.userId || "User";
      setUser({ id: userId, username });
    } catch (err) {
      console.error("Invalid token decoding", err);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, [token]);

  // Initial load of food, settings, cart, and wishlist
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchFoodList();
        setFoodList(data.foods || []);

        const setting = await getSettings();
        setTaxRate(setting.taxPercentage || 0);
        setShippingCharge(setting.shippingCharge || 0);

        const storedToken = localStorage.getItem("token");
        if (!storedToken) return;

        setToken(storedToken); // triggers the other useEffect to set user
        await loadCartData(storedToken);

        const decoded = jwt_decode(storedToken);
        const userId = decoded.id || decoded.sub || decoded.userId || decoded.user_id || decoded.username || decoded.email;
        const wishlistData = await fetchWishlistAPI(userId, storedToken);
        setWishlist(wishlistData || []);
      } catch (err) {
        console.error("Failed to load initial data", err);
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
        setQuantities({});
        setWishlist([]);
      } finally {
        setLoadingUser(false);
      }
    }

    loadData();
  }, []);

  const contextValue = {
    foodList,
    setFoodList,
    quantities,
    increaseQty,
    decreaseQty,
    removeFromCart,
    token,
    user,
    setToken,
    setUser,
    setQuantities,
    loadCartData,
    taxRate,
    shippingCharge,
    wishlist,
    setWishlist,
    addToWishlist,
    removeFromWishlist,
    loadingUser
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};
