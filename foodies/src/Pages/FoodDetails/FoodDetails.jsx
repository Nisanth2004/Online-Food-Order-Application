import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFoodDetails } from "../../service/FoodService";
import { toast } from "react-toastify";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { Star } from "lucide-react";

const FoodDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [sortOption, setSortOption] = useState("newest");

  const { increaseQty,user } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        const foodData = await fetchFoodDetails(id);
        setData(foodData);

        const res = await axios.get(`/api/foods/${id}/reviews`);
setReviews(Array.isArray(res.data) ? res.data : []);

      } catch (error) {
        toast.error("Error displaying the food details");
      }
    };

    loadFoodDetails();
  }, [id]);

  const addToCart = () => {
    increaseQty(data.id);
    navigate("/cart");
  };

  const handleReviewSubmit = async (e) => {
  e.preventDefault();
  if (newReview.rating === 0 || !newReview.comment.trim()) {
    toast.warning("Please add a rating and comment");
    return;
  }

  try {
    // Send review WITHOUT verifiedPurchase
    const res = await axios.post(`/api/foods/${id}/reviews`, {
      rating: newReview.rating,
      comment: newReview.comment,
      user: user || "Anonymous User",
    });

    // backend should return the saved review (with verifiedPurchase value)
    setReviews([res.data, ...reviews]);
    setNewReview({ rating: 0, comment: "" });

    toast.success("Review submitted successfully!");
  } catch (error) {
    toast.error("Error saving review");
  }
};


  const renderStars = (rating) => {
  return [...Array(5)].map((_, i) => (
    <i
      key={i}
      className={`fa-star me-1 fs-4 ${
        i < rating ? "fas text-warning" : "far text-secondary"
      }`}
    ></i>
  ));
};


  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortOption === "highest") {
      return b.rating - a.rating;
    }
    if (sortOption === "lowest") {
      return a.rating - b.rating;
    }
    return 0;
  });

  return (
    <section className="py-5">
      <div className="container px-4 px-lg-5 my-5">
        <div className="row gx-4 gx-lg-5 align-items-center">
          <div className="col-md-6">
            <img
              className="card-img-top mb-5 mb-md-0"
              src={data.imageUrl}
              alt={data.name}
            />
          </div>
          <div className="col-md-6">
            <div className="fs-5 mb-1">
  Category:{" "}
  {data.categories && data.categories.length > 0 ? (
    data.categories.map((cat, index) => (
      <span key={index} className="badge text-bg-warning me-1">
        {cat}
      </span>
    ))
  ) : (
    <span className="text-muted">No category</span>
  )}
</div>

            <h1 className="display-5 fw-bolder">{data.name}</h1>

            <div className="d-flex align-items-center mb-2">
              {renderStars(Math.round(averageRating))}
              <span className="ms-2">
                {averageRating.toFixed(1)} / 5
                <span className="text-muted ms-1">
                  ({reviews.length} review{reviews.length !== 1 && "s"})
                </span>
              </span>
            </div>

            <div className="fs-5 mb-2">
              <span>&#8377;{data.price}.00</span>
            </div>
            <p className="lead">{data.description}</p>
            <div className="d-flex">
              <button
                className="btn btn-outline-dark flex-shrink-0"
                type="button"
                onClick={() => addToCart()}
              >
                <i className="bi-cart-fill me-1"></i>
                Add to cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="row mt-5">
          <div className="col-md-8">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">Customer Reviews</h4>
              <select
                className="form-select w-auto"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>

            {sortedReviews.length === 0 && (
              <p className="text-muted">No reviews yet. Be the first!</p>
            )}

            {sortedReviews.map((rev) => (
              <div key={rev.id} className="mb-3 p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{rev.user}</strong>
                  <small className="text-muted">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <div>{renderStars(rev.rating)}</div>
                <p className="mb-1">{rev.comment}</p>
                {rev.verifiedPurchase && (
                  <span className="badge bg-success">Verified Purchase</span>
                )}
              </div>
            ))}
          </div>
{/* Add Review */}
<div className="col-md-4">
  <h5 className="fw-bold mb-3">Leave a Review</h5>
  <form onSubmit={handleReviewSubmit}>
    <div className="mb-2 d-flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={28}
          style={{ cursor: "pointer", marginRight: "8px" }}
          color={star <= newReview.rating ? "#FFC107" : "#e4e5e9"} // yellow vs gray
          onClick={() => setNewReview({ ...newReview, rating: star })}
        />
      ))}
    </div>
    <textarea
      className="form-control mb-2"
      rows="3"
      placeholder="Write your review..."
      value={newReview.comment}
      onChange={(e) =>
        setNewReview({ ...newReview, comment: e.target.value })
      }
    ></textarea>
    <button type="submit" className="btn btn-success w-100">
      Submit Review
    </button>
  </form>
</div>
        </div>
      </div>
    </section>
  );
};

export default FoodDetails;
