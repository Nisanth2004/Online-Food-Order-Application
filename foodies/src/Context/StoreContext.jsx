import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { fetchFoodList } from "../service/FoodService";
import {jwtDecode} from "jwt-decode";

import { addToCart, getCartData, removeQtyFromCart } from "../service/cartService";

export const StoreContext = createContext(null);

export const StoreContextProvider = (props) => {
  const [foodList, setFoodList] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

 const increaseQty = async (foodId) => {
  const food = foodList.find((f) => f.id === foodId);

  if (!food) return;

  // STOCK CHECK
  const currentQty = quantities[foodId] || 0;
  if (currentQty >= food.stock) {
    toast.warning(`Only ${food.stock} stock available`);
    return;
  }

  setQuantities((prev) => ({
    ...prev,
    [foodId]: currentQty + 1,
  }));

  await addToCart(foodId, token);
};


  const decreaseQty = async (foodId) => {
    setQuantities((prev) => ({
      ...prev,
      [foodId]: prev[foodId] > 0 ? prev[foodId] - 1 : 0,
    }));
    await removeQtyFromCart(foodId, token);
  };

  const removeFromCart = (foodId) => {
    setQuantities((prev) => {
      const updated = { ...prev };
      delete updated[foodId];
      return updated;
    });
  };

  const loadCartData = async (token) => {
    const items = await getCartData(token);
    setQuantities(items);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchFoodList();
        setFoodList(data.foods || []);

        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          try {
            const decoded = jwtDecode(storedToken);
            const now = Date.now() / 1000; // current time in seconds

            if (decoded.exp && decoded.exp < now) {
              // Token expired → clear storage and state
              localStorage.removeItem("token");
              setToken("");
              setUser(null);
              setQuantities({});
              console.warn("JWT expired. Cleared token from storage.");
            } else {
             
              setToken(storedToken);
              setUser(decoded.username || decoded.sub || "Unknown User");
              await loadCartData(storedToken);
            }
          } catch (err) {
            console.error("Invalid token", err);
            localStorage.removeItem("token");
            setToken("");
            setUser(null);
            setQuantities({});
          }
        }
      } catch (err) {
        console.error("Error loading initial data", err);
      }
    }

    loadData();
  }, []);

  const contextValue = {
    foodList,
    setFoodList,
    increaseQty,
    decreaseQty,
    quantities,
    removeFromCart,
    token,
    user,
    setToken,
    setQuantities,
    loadCartData,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
