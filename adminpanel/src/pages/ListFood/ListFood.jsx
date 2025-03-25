import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import axios from "axios";
import './ListFood.css'
import { deleteFood, getFoodList } from '../../services/FoodService';


const ListFood = () => {

  const[list,setList]=useState([])

  const fetchList=async()=>{
    try{
    const data= await  getFoodList();
    setList(data);
    }
    catch(error)
    {
      toast.error("Error occured while gettig the food list")
    }
  
  }
  useEffect(()=>{
     fetchList();
  },[])


  const removeFood=async (id)=>{

    try {
     const success=await  deleteFood(id);
     if(success)
     {
      toast.success('Food Removed')
     await fetchList();
     }
     else{
      toast.error("Error occured while removing the food")
     }
      
    } catch (error) {
      toast.error("Error occured while removing the food")
      
    }
    

  }
 
  return (
    
      <div className="py-5 row justify-content-center">
        <div className="col-11  card">
          <table className='table'>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {
                list.map((item,index)=>{
                  return(
                    <tr key={index}>
                      <td>
                        <img src={item.imageUrl} alt="" height={60} width={60} />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>&#8377;{item.price}.00</td>
                      <td className='text-danger'>
                      <i className='bi bi-x-circle-fill' onClick={() => removeFood(item.id)}></i>

                      </td>
                      
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
           
        </div>
      </div>
    
  )
}

export default ListFood
