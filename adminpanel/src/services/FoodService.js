import axios from "axios";


const API_URL="https://foodapi-latest-new1.onrender.com/api/foods"
export const addFood=async(foodData,image)=>{

    // Create FormData and send values
    const formData = new FormData();
    formData.append('food', JSON.stringify(foodData));
    formData.append('file', image);
         try {
                await axios.post(API_URL, formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                }
              );
    } catch (error) {
             throw error;
            }
    
}



export const getFoodList=async ()=>{

  try{
  const response=await axios.get(API_URL)
  return response.data;
}
catch(error)
{
   console.log("error fetching list")
}

}


export const deleteFood=async(id)=>{
  try {
    console.log(id);

   const response= await axios.delete(API_URL+"/"+id);
  return response.status===204
  } catch (error) {

    console.log("Error whilw deleting this message")
    
  }
}