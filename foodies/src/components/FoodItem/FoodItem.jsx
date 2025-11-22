import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import { renderStars } from "../../util/renderStars.jsx";
import "./FoodItem.css";

const FoodItem = ({
  name,
  description,
  id,
  imageUrl,
  price,
  sponsored,
  featured,
  averageRating,
  reviewCount,
  stock,
  categories = []
}) => {
  const { increaseQty, decreaseQty, quantities } = useContext(StoreContext);

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center">
      <div className="card food-card">
        <Link to={`/food/${id}`}>
          <img src={imageUrl} className="card-img-top" alt={name} />
        </Link>

        <div className="card-body">
          <h5 className="card-title d-flex justify-content-between align-items-center">
            {name}

            <div>
              {sponsored && <span className="badge bg-danger ms-2">Sponsored</span>}
              {featured && <span className="badge bg-warning text-dark ms-2">Best Seller</span>}
            </div>
          </h5>

          {/* Categories */}
          <div style={{ fontSize: "12px", color: "#777", marginBottom: "6px" }}>
            {categories.length > 0 ? categories.join(", ") : "No Category"}
          </div>

          <p className="card-text">{description}</p>

          <div className="d-flex justify-content-between align-items-center">
            <span className="h5 mb-0">₹{price}</span>

            <div className="d-flex align-items-center gap-1">
              {renderStars(averageRating, 20)}
              <small className="text-muted ms-1">
                ({averageRating.toFixed(1)} / {reviewCount})
              </small>
            </div>
          </div>
        </div>

        <div className="card-footer d-flex justify-content-between">
          <Link className="btn btn-primary btn-sm view-food-btn" to={`/food/${id}`}>
            View Food
          </Link>

          {stock === 0 ? (
            <button className="btn btn-secondary btn-sm" disabled>
              Out of Stock
            </button>
          ) : quantities[id] > 0 ? (
            <div className="qty-box">
              <button className="qty-btn" onClick={() => decreaseQty(id)}>
                <i className="bi bi-dash-circle"></i>
              </button>

              <span className="qty-num">{quantities[id]}</span>

              <button className="qty-btn" onClick={() => increaseQty(id)}>
                <i className="bi bi-plus-circle"></i>
              </button>
            </div>
          ) : (
            <button className="qty-btn" onClick={() => increaseQty(id)}>
              <i className="bi bi-plus-circle"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
