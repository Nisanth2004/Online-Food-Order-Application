import { createContext, useEffect, useState } from "react";
import  axios  from 'axios';
import { fetchFoodList } from "../service/FoodService";



export const StoreContext=createContext(null)

export const StoreContextProvider=(props)=>{

    const [foodList,setFoodList]=useState([]);
    const[quantities,setQuantities]=useState({})


    const increaseQty=(foodId)=>{
        setQuantities((prev)=>({...prev,[foodId]:(prev[foodId]|| 0)+1}))

    }

    const decreaseQty=(foodId)=>{
        setQuantities((prev)=>({...prev,[foodId]:prev[foodId]>0?prev[foodId]-1:0}))

    }

 
    const removeFromCart=(foodId)=>{
        setQuantities((prevQuantities)=>{
            const updatedQuantities={...prevQuantities};
            delete updatedQuantities[foodId];
            return updatedQuantities; 
        })

    }

    useEffect(()=>{
        async function loadData()
        {
          const data= await fetchFoodList()
          setFoodList(data);
 
        }
        loadData()

    },[])

    const contextValue={
        foodList,
        increaseQty,
        decreaseQty,
        quantities,
        removeFromCart

    }


    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}