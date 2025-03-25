import { createContext, useEffect, useState } from "react";
import { axios } from 'axios';

export const storeContext=createContext(null)

export const StoreContextProvider=(props)=>{

    const [foodList,setFoodList]=useState([]);

    const fetchFoodList=async()=>{
      const response=await  axios.get('http://localhost:8080/api/foods');
      setFoodList(response.data)
    }

    useEffect(()=>{
        async function loadData()
        {
           await fetchFoodList()
 
        }
        loadData()

    },[])

    const contextValue={
        foodList

    }


    return (
        <StoreContextProvider.Provider value={foodList}>
            {props.children}
        </StoreContextProvider.Provider>
    )
}