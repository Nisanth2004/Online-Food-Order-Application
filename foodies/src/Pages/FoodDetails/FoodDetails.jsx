import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFoodDetails } from "../../service/FoodService";
import { toast } from "react-toastify";
import { StoreContext } from "../../Context/StoreContext";
import { Star, Upload, CheckCircle, Timer } from "lucide-react";
import api from "../../service/CustomAxiosInstance";
import "./FoodDetails.css";

const REVIEWS_PER_PAGE = 5;

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { increaseQty, user } = useContext(StoreContext);

  const [data, setData] = useState({});
  const [reviews, setReviews] = useState([]);
  const [sortedReviews, setSortedReviews] = useState([]);
  const [sortType, setSortType] = useState("latest");
  const [page, setPage] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [reviewImage, setReviewImage] = useState(null);

  const [flashSale, setFlashSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE) || 1;
  const paginatedReviews = sortedReviews.slice(0, page * REVIEWS_PER_PAGE);

  /* ---------------- SORT REVIEWS ---------------- */
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

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        const foodData = await fetchFoodDetails(id);
        setData(foodData);

        const res = await api.get(`/api/foods/${id}/reviews`);
        const list = Array.isArray(res.data) ? res.data : [];
        setReviews(list);
        setSortedReviews(sortReviews(list, "latest"));

        const saleRes = await api.get("/api/admin/flash-sales/active");
        const activeSale = saleRes.data.find((s) => s.foodId === id);
        setFlashSale(activeSale || null);
      } catch {
        toast.error("Error displaying food details");
      }
    };

    loadFoodDetails();
  }, [id]);

  /* ---------------- FLASH SALE TIMER ---------------- */
  useEffect(() => {
    if (!flashSale) return;

    const interval = setInterval(() => {
      const end = new Date(flashSale.endTime);
      const now = new Date();
      const diff = end - now;

      if (diff <= 0) {
        setFlashSale(null);
        clearInterval(interval);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [flashSale]);

  /* ---------------- CART ---------------- */
  const addToCart = () => {
    increaseQty(data.id);
    navigate("/cart");
  };

  /* ---------------- SORT HANDLER ---------------- */
  const handleSort = (type) => {
    setSortType(type);
    setSortedReviews(sortReviews(reviews, type));
    setPage(1);
  };

  /* ---------------- SUBMIT REVIEW ---------------- */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!newReview.rating && !newReview.comment.trim() && !reviewImage) {
      toast.warning("Add rating, comment or image");
      return;
    }

    if (reviewImage && reviewImage.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user", user || "Anonymous");
      formData.append("rating", newReview.rating);
      formData.append("comment", newReview.comment);
      if (reviewImage) formData.append("image", reviewImage);

      const res = await api.post(`/api/foods/${id}/reviews`, formData);

      const updated = [res.data, ...reviews];
      setReviews(updated);
      setSortedReviews(sortReviews(updated, sortType));
      setNewReview({ rating: 0, comment: "" });
      setReviewImage(null);

      toast.success("Review added");
    } catch {
      toast.error("Failed to submit review");
    }
  };

  /* ---------------- HELPFUL ---------------- */
  const markHelpful = async (reviewId) => {
    const key = `helpful_${reviewId}`;
    if (localStorage.getItem(key)) {
      toast.info("Already marked helpful");
      return;
    }

    try {
      const res = await api.put(
        `/api/foods/${data.id}/reviews/${reviewId}/helpful`
      );

      localStorage.setItem(key, "true");

      setSortedReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, helpful: res.data.helpful, marked: true }
            : r
        )
      );
    } catch {
      toast.error("Failed to mark helpful");
    }
  };

  /* ---------------- UI HELPERS ---------------- */
  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`fa-star me-1 fs-5 ${
          i < rating ? "fas text-warning" : "far text-secondary"
        }`}
      />
    ));

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : 0;

  /* ---------------- RENDER ---------------- */
  return (
    <section className="py-4">
      <div className="container px-3 px-lg-4 my-4">

        {/* PRODUCT */}
        <div className="row gx-4">
          <div className="col-md-6">
            <img className="food-imge mb-4" src={data.imageUrl} alt={data.name} />
          </div>

          <div className="col-md-6">
            <h1 className="fw-bold">{data.name}</h1>

            <div className="mb-3">
              {renderStars(Math.round(averageRating))}
              <span className="ms-2 fw-bold">
                {averageRating.toFixed(1)} ({reviews.length})
              </span>
            </div>

            {flashSale ? (
              <div className="flash-sale-box mb-3">
                <span className="flash-badge">FLASH SALE</span>

                <div className="flash-price">
                  <span className="old-price">₹{data.price}</span>
                  <span className="sale-price">₹{flashSale.salePrice}</span>
                </div>

                <div className="flash-timer">
                  <Timer size={16} /> Deal ends in <b>{timeLeft}</b>
                </div>
              </div>
            ) : (
              <h3 className="text-success mb-3">₹{data.price}</h3>
            )}

            <p className="lead">{data.description}</p>

            <button
              className="btn btn-dark btn-lg"
              disabled={data.stock === 0}
              onClick={addToCart}
            >
              {data.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="row mt-5">
          <div className="col-md-8">
            <div className="d-flex justify-content-between mb-3">
              <h4 className="fw-bold">Customer Reviews</h4>
              <select
                className="form-select w-auto"
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="high">Highest</option>
                <option value="low">Lowest</option>
              </select>
            </div>

            {paginatedReviews.map((rev) => (
              <div key={rev.id} className="review-card mb-3">
                <div className="d-flex align-items-center">
                  <img
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${rev.user}`}
                    className="review-avatar"
                    alt=""
                  />
                  <div className="ms-2">
                    <b>{rev.user}</b>
                    <div className="text-muted small">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mt-1">{renderStars(rev.rating)}</div>
                <p className="mt-2">{rev.comment}</p>

                {rev.verifiedPurchase && (
                  <span className="verified-chip">
                    <CheckCircle size={14} /> Verified Purchase
                  </span>
                )}

                {rev.imageUrl && (
                  <img
                    src={rev.imageUrl}
                    className="review-img zoomable"
                    onClick={() => setActiveImage(rev.imageUrl)}
                    alt=""
                  />
                )}

                <button
                  className={`helpful-btn mt-2 ${rev.marked ? "marked" : ""}`}
                  onClick={() => markHelpful(rev.id)}
                >
                  👍 Helpful ({rev.helpful || 0})
                </button>
              </div>
            ))}

            {page < totalPages && (
              <button
                className="btn btn-outline-dark mt-3"
                onClick={() => setPage(page + 1)}
              >
                Load More
              </button>
            )}
          </div>

          {/* ADD REVIEW */}
          <div className="col-md-4">
            <div className="review-box">
              <h5 className="fw-bold mb-3">Leave a Review</h5>

              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={30}
                      color={s <= newReview.rating ? "#FFC107" : "#ccc"}
                      onClick={() => setNewReview({ ...newReview, rating: s })}
                    />
                  ))}
                </div>

                <label className="file-drop-zone mb-3">
                  <Upload size={18} /> Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setReviewImage(e.target.files[0])}
                  />
                </label>

                {reviewImage && (
                  <div className="preview-box">
                    <img
                      src={URL.createObjectURL(reviewImage)}
                      alt="Preview"
                      className="preview-img"
                    />
                    <button
                      type="button"
                      className="remove-img"
                      onClick={() => setReviewImage(null)}
                    >
                      ✕
                    </button>
                  </div>
                )}

                <textarea
                  className="form-control mb-3"
                  rows="3"
                  placeholder="Write review..."
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                />

                <button className="btn btn-success w-100">
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {activeImage && (
        <div className="img-modal" onClick={() => setActiveImage(null)}>
          <img src={activeImage} className="img-modal-content" alt="" />
        </div>
      )}
    </section>
  );
};

export default FoodDetails;
