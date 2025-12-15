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

  const [appliedCoupon, setAppliedCoupon] = useState(null);
 const [discount, setDiscount] = useState(0);

  // 🔥 COMBO STATE
  const [comboCart, setComboCart] = useState(null);

  // ------------------ FOOD CART ------------------ //
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
    setQuantities(prev => ({
      ...prev,
      [foodId]: Math.max((prev[foodId] || 0) - 1, 0)
    }));
    await removeQtyFromCart(foodId, token);
  };

  const removeFromCart = (foodId) => {
    setQuantities(prev => {
      const updated = { ...prev };
      delete updated[foodId];
      return updated;
    });
  };

  const loadCartData = async (token) => {
    const items = await getCartData(token);
    setQuantities(items);
  };

  // ------------------ 🔥 COMBO CART ------------------ //

  const addComboToCart = (combo) => {
  if (comboCart) {
    toast.error("Only one combo allowed per order");
    return;
  }

  setComboCart({
    id: combo.id,
    name: combo.name,
    comboPrice: combo.comboPrice,
    qty: 1,
    imageUrl: combo.imageUrl
  });

  toast.success("Combo added to cart");
};


  const increaseComboQty = () => {
    setComboCart(prev => ({
      ...prev,
      qty: prev.qty + 1
    }));
  };

  const decreaseComboQty = () => {
    setComboCart(prev => {
      if (prev.qty === 1) return prev;
      return { ...prev, qty: prev.qty - 1 };
    });
  };

  const removeComboFromCart = () => {
    setComboCart(null);
    toast.success("Combo removed from cart");
  };

  // ------------------ WISHLIST ------------------ //
  const addToWishlist = async (foodId) => {
    if (!user?.id) return toast.error("Login required");
    await addToWishlistAPI(foodId, user.id, token);
    setWishlist(prev => [...prev, foodId]);
  };

  const removeFromWishlist = async (foodId) => {
    await removeFromWishlistAPI(foodId, user.id, token);
    setWishlist(prev => prev.filter(id => id !== foodId));
  };

  // ------------------ AUTH ------------------ //
  useEffect(() => {
    if (!token) return setLoadingUser(false);

    try {
      const decoded = jwt_decode(token);
      setUser({ id: decoded.id || decoded.sub, username: decoded.username });
    } catch {
      setToken("");
      localStorage.removeItem("token");
    } finally {
      setLoadingUser(false);
    }
  }, [token]);

  // ------------------ INITIAL LOAD ------------------ //
  useEffect(() => {
    async function load() {
      const data = await fetchFoodList();
      setFoodList(data.foods || []);

      const setting = await getSettings();
      setTaxRate(setting.taxPercentage || 0);
      setShippingCharge(setting.shippingCharge || 0);

      if (token) {
        await loadCartData(token);
      }
    }
    load();
  }, []);

  return (
    <StoreContext.Provider value={{
      foodList,
      quantities,
      setFoodList, 
      increaseQty,
      decreaseQty,
      removeFromCart,
      setQuantities,

      comboCart,
      addComboToCart,
      increaseComboQty,
      decreaseComboQty,
      removeComboFromCart,

      taxRate,
      shippingCharge,

      appliedCoupon,
      setAppliedCoupon,
      discount,
      setDiscount,

      wishlist,
      addToWishlist,
      removeFromWishlist,

      token,
      setToken, 
      setUser,      
        loadCartData,      
      user,
      loadingUser
    }}>
      {props.children}
    </StoreContext.Provider>
  );
};
