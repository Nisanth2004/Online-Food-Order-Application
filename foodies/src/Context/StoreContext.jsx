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
import jwt_decode from "jwt-decode";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
  const [foodList, setFoodList] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [taxRate, setTaxRate] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [loadingUser, setLoadingUser] = useState(true);

  // ------------------ CART FUNCTIONS ------------------ //
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

  // ------------------ WISHLIST FUNCTIONS ------------------ //
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
      toast.success("Your item had been removed from wishlist")
    } catch (err) {
      console.error("Remove from wishlist failed", err);
      toast.error("Failed to remove from wishlist");
    }
  };

  // ------------------ USER TOKEN & STATE ------------------ //
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      const decoded = jwt_decode(token);
      const now = Date.now() / 1000;

      // Check token expiration
      if (decoded.exp && decoded.exp < now) {
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
      } else {
        const userId = decoded.id || decoded.sub || decoded.userId || decoded.user_id || decoded.username || decoded.email;
        const username = decoded.username || decoded.email || decoded.sub || decoded.userId || "User";
        setUser({ id: userId, username });
      }
    } catch (err) {
      console.error("Invalid token decoding", err);
      setUser(null);
      localStorage.removeItem("token");
      setToken("");
    } finally {
      setLoadingUser(false);
    }
  }, [token]);

  // ------------------ INITIAL LOAD ------------------ //
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchFoodList();
        setFoodList(data.foods || []);

        const setting = await getSettings();
        setTaxRate(setting.taxPercentage || 0);
        setShippingCharge(setting.shippingCharge || 0);

        if (!token) return;

        await loadCartData(token);

        const decoded = jwt_decode(token);
        const userId = decoded.id || decoded.sub || decoded.userId || decoded.user_id || decoded.username || decoded.email;
        const wishlistData = await fetchWishlistAPI(userId, token);
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

  // ------------------ CONTEXT VALUE ------------------ //
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
