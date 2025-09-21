import axios from "axios";

//const API_URL="https://foodapi-latest-new1.onrender.com/api/cart"
const API_URL="http://localhost:8080/api/cart"

export const addToCart =async (foodId,token)=>{
    try {
        await axios.post(API_URL,
            {foodId},
            {headers:{"Authorization":`Bearer ${token}`}}
        )
        
    } catch (error) {
        console.log('Error while adding the cart data',error);
        
    }

}

export const removeQtyFromCart =async (foodId,token)=>{
    try {
        axios.post(API_URL+'/remove',{foodId},
            {headers:{"Authorization":`Bearer ${token}`}}
        )
        
    } catch (error) {
        console.log('Error while removing  the qty  data',error);
        
    }

}

export const getCartData = async (token) => {
    if (!token) {
        console.error("Missing token, cannot fetch cart data");
        return;
    }

    try {
        const response = await axios.get(API_URL, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        return response.data.items;
    } catch (error) {
        console.error("Error while fetching the cart data:", error.response ? error.response.data : error);
    }
};
