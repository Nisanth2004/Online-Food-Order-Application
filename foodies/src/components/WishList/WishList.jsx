import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { removeFromWishlist as removeWishlistAPI } from "../../service/WishlistService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const { wishlist, foodList,user, token } = useContext(StoreContext);
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
  <div className="text-center py-5">
    <img 
      src="https://img.icons8.com/emoji/96/000000/waving-hand-emoji.png" 
      alt="No Wishlist" 
      className="mb-3"
    />
    <h5 className="text-muted">Your wishlist is looking empty! 😢</h5>
    <p className="text-muted mb-3">
      Browse our delicious foods and add your favorites to your wishlist for easy access later.
    </p>
    <Link to="/explore" className="btn btn-primary btn-sm">
      Explore Foods
    </Link>
  </div>
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
