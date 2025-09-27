import { createContext, useEffect, useState } from "react";
import  axios  from 'axios';
import { fetchFoodList } from "../service/FoodService";
import {jwtDecode}from "jwt-decode";
import { addToCart, getCartData, removeQtyFromCart } from "../service/cartService";



export const StoreContext=createContext(null)

export const StoreContextProvider=(props)=>{

    const [foodList,setFoodList]=useState([]);
    const[quantities,setQuantities]=useState({})
    const[token,setToken]=useState('')
     const [user, setUser] = useState(null); 


    const increaseQty=async (foodId)=>{
        setQuantities((prev)=>({...prev,[foodId]:(prev[foodId]|| 0)+1}))
       await addToCart(foodId,token )
    }

    const decreaseQty=async (foodId)=>{
        setQuantities((prev)=>({...prev,[foodId]:prev[foodId]>0?prev[foodId]-1:0}))
        await removeQtyFromCart(foodId,token);
    }

 
    const removeFromCart=(foodId)=>{
        setQuantities((prevQuantities)=>{
            const updatedQuantities={...prevQuantities};
            delete updatedQuantities[foodId];
            return updatedQuantities; 
        })

    }


    const loadCartData=async (token)=>{
       const items=await getCartData(token)
       setQuantities(items)
    }

    useEffect(() => {
  async function loadData() {
    const data = await fetchFoodList();
    setFoodList(data);

    const storedToken = localStorage.getItem("token"); // ✅ define it here
    if (storedToken) {
      setToken(storedToken);

      try {
        const decoded = jwtDecode(storedToken); // ✅ now use storedToken
        setUser(decoded.username || decoded.sub || "Unknown User");
      } catch (err) {
        console.error("Invalid token", err);
      }

      await loadCartData(storedToken); // ✅ pass storedToken
    }
  }

  loadData();
}, []);


    const contextValue={
        foodList,
        increaseQty,
        decreaseQty,
        quantities,
        removeFromCart,
        token,
        user,
        setToken,
        setQuantities,
        loadCartData

    }


    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}