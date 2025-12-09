import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { removeFromWishlist as removeWishlistAPI } from "../../service/WishlistService"; // your API functions
import { toast } from "react-toastify";

export default function Wishlist() {
  const { wishlist, foodList, user, token } = useContext(StoreContext);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Filter foodList based on current wishlist
    setItems(foodList.filter(food => wishlist.includes(food.id)));
  }, [wishlist, foodList]);

  const handleRemove = async (foodId) => {
    try {
      if (!user?.id) {
        toast.error("Login required");
        return;
      }

      await removeWishlistAPI(foodId, user.id, token); // call backend
      toast.success("Removed from wishlist");

      // Remove from local state immediately
      setItems(prev => prev.filter(food => food.id !== foodId));
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3 fw-bold">My Wishlist ❤️</h2>

      {items.length === 0 ? (
        <p className="text-muted">Your wishlist is empty.</p>
      ) : (
        <div className="row">
          {items.map(food => (
            <FoodItem
              key={food.id}
              {...food}
              wishlistRemove={true} // enable remove from this page
              onWishlistRemove={() => handleRemove(food.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
