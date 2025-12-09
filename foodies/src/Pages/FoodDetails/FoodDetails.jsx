import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFoodDetails } from "../../service/FoodService";
import { toast } from "react-toastify";
import { StoreContext } from "../../Context/StoreContext";
import { Star, Upload, CheckCircle } from "lucide-react";
import api from "../../service/CustomAxiosInstance";
import "./FoodDetails.css";

const REVIEWS_PER_PAGE = 5;

const FoodDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState({});
  const [reviews, setReviews] = useState([]);
  const [sortedReviews, setSortedReviews] = useState([]);
  const [sortType, setSortType] = useState("latest");

  const [page, setPage] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE) || 1;

  const paginatedReviews = sortedReviews.slice(
    0,
    page * REVIEWS_PER_PAGE
  );

  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [reviewImage, setReviewImage] = useState(null);
  const { increaseQty, user } = useContext(StoreContext);
  

  const navigate = useNavigate();

  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        const foodData = await fetchFoodDetails(id);
        setData(foodData);

        const res = await api.get(`/api/foods/${id}/reviews`);
        const list = Array.isArray(res.data) ? res.data : [];
        setReviews(list);
        setSortedReviews(sortReviews(list, "latest"));
      } catch {
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

    if (
      newReview.rating === 0 &&
      !newReview.comment.trim() &&
      !reviewImage
    ) {
      toast.warning("Add a rating, message or photo");
      return;
    }

    try {
      const formData = new FormData();
      formData.append(
        "review",
        new Blob(
          [
            JSON.stringify({
              rating: newReview.rating,
              comment: newReview.comment,
              user: user || "Anonymous User",
            }),
          ],
          { type: "application/json" }
        )
      );

      if (reviewImage) formData.append("image", reviewImage);

      const res = await api.post(`/api/foods/${id}/reviews`, formData);
      const newList = [res.data, ...reviews];

      setReviews(newList);
      setSortedReviews(sortReviews(newList, sortType));

      setNewReview({ rating: 0, comment: "" });
      setReviewImage(null);

      toast.success("Review submitted!");
    } catch {
      toast.error("Error saving review");
    }
  };

  const sortReviews = (list, type) => {
    switch (type) {
      case "high":
        return [...list].sort((a, b) => b.rating - a.rating);
      case "low":
        return [...list].sort((a, b) => a.rating - b.rating);
      default:
        return [...list].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  };

  const handleSort = (type) => {
    setSortType(type);
    setSortedReviews(sortReviews(reviews, type));
    setPage(1);
  };

 const markHelpful = async (id) => {
  const key = `helpful_${id}`;

  if (localStorage.getItem(key)) {
    toast.info("You already marked this review helpful");
    return;
  }

  try {
    const res = await api.put(`/api/foods/${data.id}/reviews/${id}/helpful`);
    const updated = res.data;

    localStorage.setItem(key, "true");

    // Update in UI
    setSortedReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, helpful: updated.helpful, marked: true } : r
      )
    );

  } catch {
    toast.error("Failed to mark helpful");
  }
};



  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`fa-star me-1 fs-5 ${
          i < rating ? "fas text-warning" : "far text-secondary"
        }`}
      ></i>
    ));

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="py-4">
      <div className="container px-3 px-lg-4 my-4">
        
        {/* ---------- FOOD IMAGE + DETAILS ---------- */}
        <div className="row gx-4 align-items-start">
          <div className="col-md-6">
            <img className="food-img mb-4" src={data.imageUrl} alt={data.name} />
          </div>

          <div className="col-md-6 food-info">
            <h1 className="fw-bold mb-2">{data.name}</h1>

            <div className="d-flex align-items-center mb-3">
              {renderStars(Math.round(averageRating))}
              <span className="ms-2 fw-bold">
                {averageRating.toFixed(1)} / 5
                <span className="text-muted"> ({reviews.length} reviews)</span>
              </span>
            </div>

            <h3 className="text-success mb-3">₹{data.price}</h3>

            <p className="lead">{data.description}</p>

            <button
              disabled={data.stock === 0}
              className="btn btn-dark btn-lg mt-2"
              onClick={addToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* ---------- REVIEW SUMMARY ---------- */}
        {reviews.length > 0 && (
          <div className="review-summary-card mt-5">
            <h5 className="fw-bold mb-2">Summary</h5>
            <p className="text-muted small">
              Most users mentioned good taste, quality ingredients, and fast delivery.
            </p>
          </div>
        )}

        {/* ---------- REVIEWS ---------- */}
        <div className="row review-section mt-4">

          <div className="col-md-8">
            <div className="d-flex justify-content-between">
              <h4 className="fw-bold mb-3">Customer Reviews</h4>

              <select
                className="form-select w-auto"
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="high">Highest Rated</option>
                <option value="low">Lowest Rated</option>
              </select>
            </div>

            {paginatedReviews.map((rev) => (
              <div key={rev.id} className="review-card mb-3">

                {/* HEADER */}
                <div className="review-header d-flex align-items-center">
                  <img
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${rev.user}`}
                    className="review-avatar"
                    alt="avatar"
                  />
                  <div className="ms-2">
                    <span className="review-user">{rev.user}</span>
                    <span className="review-date ms-2">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* RATING */}
                <div className="mt-1">{renderStars(rev.rating)}</div>

                {/* COMMENT */}
                <p className="mt-2 mb-1">{rev.comment}</p>

                {/* VERIFIED */}
                {rev.verifiedPurchase && (
                  <span className="verified-chip">
                    <CheckCircle size={14} className="me-1" /> Verified Purchase
                  </span>
                )}

                {/* IMAGE */}
                {rev.imageUrl && (
                  <img
                    src={rev.imageUrl}
                    className="review-img zoomable"
                    alt="review"
                    onClick={() => setActiveImage(rev.imageUrl)}
                  />
                )}

                <button
  className={`helpful-btn mt-2 ${rev.marked ? "marked" : ""}`}
  onClick={() => markHelpful(rev.id)}
>
  <span className="helpful-icon">👍</span>
  Helpful ({rev.helpful || 0})
</button>


              </div>
            ))}

            {/* LOAD MORE */}
            {page < totalPages && (
              <div className="text-center mt-3">
                <button
                  className="btn btn-outline-dark load-more-btn"
                  onClick={() => setPage(page + 1)}
                >
                  Load More Reviews
                </button>
              </div>
            )}
          </div>

          {/* ---------- ADD REVIEW BOX ---------- */}
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

                <label className="file-drop-zone mb-3">
                  <Upload size={18} className="me-2" />
                  <span>Click or Drop image here</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReviewImage(e.target.files[0])}
                  />
                </label>

                {reviewImage && (
                  <img
                    src={URL.createObjectURL(reviewImage)}
                    className="img-fluid rounded mb-2"
                    style={{ maxHeight: 150, objectFit: "cover" }}
                    alt="preview"
                  />
                )}

                <textarea
                  className="form-control mb-3"
                  rows="3"
                  placeholder="Write your review..."
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                ></textarea>

                <button className="btn btn-success w-100">Submit Review</button>
              </form>

            </div>
          </div>
        </div>
      </div>

      {/* ---------- IMAGE MODAL ---------- */}
      {activeImage && (
        <div className="img-modal" onClick={() => setActiveImage(null)}>
          <img src={activeImage} className="img-modal-content" alt="zoom" />
        </div>
      )}
    </section>
  );
};

export default FoodDetails;
