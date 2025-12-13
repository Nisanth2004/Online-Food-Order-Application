import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import "./FoodItem.css";
import { toast } from "react-toastify";

const FoodItem = ({
  id,
  name,
  description,
  imageUrl,
  mrp,
  sellingPrice,
  offerLabel,
  sponsored,
  featured,
  stock,
  categories,
}) => {
  const { user, wishlist, addToWishlist, removeFromWishlist } = useContext(StoreContext);

  // SAFE category handling
  const safeCategories = Array.isArray(categories)
    ? categories
    : categories
    ? [categories]  // convert string → array
    : [];

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Login required");
      return;
    }
    wishlist.includes(id) ? removeFromWishlist(id) : addToWishlist(id);
  };

  const offerActive = offerLabel && offerLabel.trim() !== "";

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center">
      <div className="card food-card shadow-sm">
        <Link to={`/food/${id}`}>
          <img src={imageUrl} className="card-img-top" alt={name} />
        </Link>

        <div className="card-body">
          <h5 className="card-title mb-2">{name}</h5>

          {/* BADGES */}
          <div className="mb-2">
            {offerActive && <span className="badge bg-success me-1">{offerLabel}</span>}
            {sponsored && <span className="badge bg-danger me-1">Sponsored</span>}
            {featured && <span className="badge bg-warning text-dark me-1">Best Seller</span>}
          </div>

          {/* CATEGORY */}
          <div className="text-muted small mb-2">
            {safeCategories.length > 0 ? safeCategories.join(", ") : "No Category"}
          </div>

          <p className="card-text">{description}</p>

          {/* PRICE */}
          <div className="mb-2">
            {offerActive ? (
              <>
                <span className="text-muted text-decoration-line-through me-2">₹{mrp}</span>
                <span className="fw-bold text-success">₹{sellingPrice}</span>
              </>
            ) : (
              <span className="fw-bold">₹{sellingPrice}</span>
            )}
          </div>

          {/* WISHLIST HEART */}
          <div
            className={`wishlist-heart ${wishlist.includes(id) ? "active-heart" : ""}`}
            onClick={handleWishlist}
          >
            <i
              className={`bi ${wishlist.includes(id) ? "bi-heart-fill text-danger" : "bi-heart"}`}
            ></i>
          </div>

          {/* STOCK BUTTON */}
          {stock === 0 ? (
            <button className="btn btn-secondary w-100 mt-2" disabled>
              Out of Stock
            </button>
          ) : (
            <Link className="btn btn-primary w-100 mt-2" to={`/food/${id}`}>
              View / Add to Cart
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
