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
  const [appliedCouponDetails, setAppliedCouponDetails] = useState(null);

  const [cartLoading, setCartLoading] = useState(true);


  /* 🔥 COMBO CART (PERSISTENT) */
  const [comboCart, setComboCart] = useState(() => {
    const stored = localStorage.getItem("comboCart");
    return stored ? JSON.parse(stored) : null;
  });

  /* --------------------------------------------------
     FOOD CART
  -------------------------------------------------- */
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
  try {
    setCartLoading(true);
    const items = await getCartData(token);
    setQuantities(items);
  } finally {
    setCartLoading(false);
  }
};


  /* --------------------------------------------------
     🔥 COMBO CART (FULLY FIXED)
  -------------------------------------------------- */

  const addComboToCart = (combo) => {
    if (comboCart) {
      toast.error("Only one combo allowed per order");
      return;
    }

    const comboItem = {
      id: combo.id,
      name: combo.name,
      comboPrice: combo.comboPrice,
      qty: 1,
      imageUrl: combo.imageUrl
    };

    setComboCart(comboItem);
    localStorage.setItem("comboCart", JSON.stringify(comboItem));
    toast.success("Combo added to cart");
  };

  const increaseComboQty = () => {
    setComboCart(prev => {
      const updated = { ...prev, qty: prev.qty + 1 };
      localStorage.setItem("comboCart", JSON.stringify(updated));
      return updated;
    });
  };

  const decreaseComboQty = () => {
    setComboCart(prev => {
      if (prev.qty === 1) return prev;
      const updated = { ...prev, qty: prev.qty - 1 };
      localStorage.setItem("comboCart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeComboFromCart = () => {
    setComboCart(null);
    localStorage.removeItem("comboCart");
    toast.success("Combo removed from cart");
  };

  /* --------------------------------------------------
     WISHLIST
  -------------------------------------------------- */
  const addToWishlist = async (foodId) => {
    if (!user?.id) return toast.error("Login required");
    await addToWishlistAPI(foodId, user.id, token);
    setWishlist(prev => [...prev, foodId]);
  };

  const removeFromWishlist = async (foodId) => {
    await removeFromWishlistAPI(foodId, user.id, token);
    setWishlist(prev => prev.filter(id => id !== foodId));
  };

  /* --------------------------------------------------
     AUTH
  -------------------------------------------------- */
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

  const applyCoupon = (coupon, subtotal) => {
  if (subtotal < coupon.minOrderAmount) {
    toast.error(
      `Add ₹${coupon.minOrderAmount - subtotal} more to apply this coupon`
    );
    return false;
  }

  const discountAmount =
    (subtotal * coupon.discountPercent) / 100;

  setAppliedCoupon(coupon.code);
  setAppliedCouponDetails(coupon);
  setDiscount(discountAmount);

  toast.success("Coupon applied");
  return true;
};
useEffect(() => {
  if (!appliedCouponDetails) return;

  const cartSubtotal = Object.entries(quantities).reduce(
    (sum, [id, qty]) => {
      const food = foodList.find(f => f.id === id);
      return food ? sum + food.price * qty : sum;
    },
    0
  ) + (comboCart ? comboCart.comboPrice * comboCart.qty : 0);

  if (cartSubtotal < appliedCouponDetails.minOrderAmount) {
    setAppliedCoupon(null);
    setAppliedCouponDetails(null);
    setDiscount(0);
    toast.error("Coupon removed (minimum order not met)");
  }
}, [quantities, comboCart]);

  /* --------------------------------------------------
     INITIAL LOAD
  -------------------------------------------------- */
  useEffect(() => {
  async function load() {
    const data = await fetchFoodList();
    setFoodList(data.foods || []);

    const setting = await getSettings();
    setTaxRate(setting.taxPercentage || 0);
    setShippingCharge(setting.shippingCharge || 0);

    if (token) {
      await loadCartData(token);
    } else {
      setCartLoading(false); 
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
  appliedCouponDetails,
  applyCoupon,
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
      loadingUser,
       cartLoading
    }}>
      {props.children}
    </StoreContext.Provider>
  );
};
