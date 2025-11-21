import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFoodDetails } from "../../service/FoodService";
import { toast } from "react-toastify";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { Star } from "lucide-react";
import "./FoodDetails.css";
import api from '../../service/CustomAxiosInstance';

const FoodDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [sortOption, setSortOption] = useState("newest");

  const { increaseQty, user } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        const foodData = await fetchFoodDetails(id);
        setData(foodData);

        const res = await api.get(`/api/foods/${id}/reviews`);
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
      const res = await api.post(`/api/foods/${id}/reviews`, {
        rating: newReview.rating,
        comment: newReview.comment,
        user: user || "Anonymous User",
      });

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
        className={`fa-star me-1 fs-5 ${
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
    <section className="py-4">
      <div className="container px-3 px-lg-4 my-4">

        {/* MAIN FOOD INFO */}
        <div className="row gx-4 align-items-start">
          <div className="col-md-6">
            <img
              className="food-img mb-4"
              src={data.imageUrl}
              alt={data.name}
            />
          </div>

          <div className="col-md-6 food-info">
            <div className="mb-3">
              <span className="fw-bold">Category: </span>
              {data.categories && data.categories.length > 0 ? (
                data.categories.map((cat, index) => (
                  <span key={index} className="badge bg-warning text-dark me-2 category-badge">
                    {cat}
                  </span>
                ))
              ) : (
                <span className="text-muted">No category</span>
              )}
            </div>

            <h1 className="fw-bold mb-2">{data.name}</h1>

            <div className="d-flex align-items-center mb-3">
              {renderStars(Math.round(averageRating))}
              <span className="ms-2">
                {averageRating.toFixed(1)} / 5
                <span className="text-muted"> ({reviews.length} reviews)</span>
              </span>
            </div>

            <h3 className="text-success mb-3">₹{data.price}.00</h3>

            <p className="lead">{data.description}</p>

            <button
              className="btn btn-dark btn-lg mt-2"
              onClick={addToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="review-section row mt-5">
          <div className="col-md-8">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold">Customer Reviews</h4>

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
              <div key={rev.id} className="review-card mb-3">
                <div className="review-header">
                  <span className="review-user">{rev.user}</span>
                  <span className="review-date">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-1">{renderStars(rev.rating)}</div>

                <p className="mt-2 mb-1">{rev.comment}</p>

                {rev.verifiedPurchase && (
                  <span className="badge bg-success">Verified Purchase</span>
                )}
              </div>
            ))}
          </div>

          {/* ADD REVIEW FORM */}
          <div className="col-md-4">
            <div className="review-box">
              <h5 className="fw-bold mb-3">Leave a Review</h5>

              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3 d-flex star-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={30}
                      color={star <= newReview.rating ? "#FFC107" : "#d5d5d5"}
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                    />
                  ))}
                </div>

                <textarea
                  className="form-control mb-3"
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

      </div>
    </section>
  );
};

export default FoodDetails;
