import React, { useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = () => {
   const { foodList } = useContext(StoreContext);

   return (
    <div className='container'>
        <div className="row">
            {foodList.length > 0 ? (
                foodList.map((food,index)=>(
           <FoodItem 
                   key={index}
                   name={food.name}
                   description={food.description}
                   id={food.id}
                   price={food.price}
                   imageUrl={food.imageUrl}
            />
                ))
               
            ) : (
                <div className='text-center mt-4'>
                <h4>No foods found</h4>
            </div>
               
                
            )}
        </div>
    </div>
   );
}

export default FoodDisplay;
