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
  const navigate = useNavigate();
  const { increaseQty, user } = useContext(StoreContext);

  const [data, setData] = useState({
    categories: [],
    name: "",
    imageUrl: "",
    mrp: 0,
    sellingPrice: 0,
    description: "",
    stock: 0,
    sponsored: false,
    featured: false,
    offerLabel: "",
  });

  const [reviews, setReviews] = useState([]);
  const [sortedReviews, setSortedReviews] = useState([]);
  const [sortType, setSortType] = useState("latest");
  const [page, setPage] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [reviewImage, setReviewImage] = useState(null);

  const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE) || 1;
  const paginatedReviews = sortedReviews.slice(0, page * REVIEWS_PER_PAGE);

  // Fetch food details & reviews
  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        const foodData = await fetchFoodDetails(id);

        // Ensure categories is always an array
        setData({
          ...foodData,
          categories: Array.isArray(foodData.categories)
            ? foodData.categories
            : foodData.categories
            ? [foodData.categories]
            : [],
        });

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

  // Add to cart
  const addToCart = () => {
    increaseQty(data.id);
    navigate("/cart");
  };

  // Sort reviews
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

  // Render stars
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

  const offerActive = data.offerLabel && data.offerLabel.trim() !== "";

  return (
    <section className="py-4">
      <div className="container px-3 px-lg-4 my-4">
        <div className="row gx-4 align-items-start">
          {/* IMAGE */}
          <div className="col-md-6">
            <img className="food-img mb-4" src={data.imageUrl} alt={data.name} />
          </div>

          {/* DETAILS */}
          <div className="col-md-6 food-info">
            <h1 className="fw-bold mb-2">{data.name}</h1>

            {/* BADGES */}
            <div className="mb-2">
              {offerActive && (
                <span className="badge bg-success me-1">{data.offerLabel}</span>
              )}
              {data.sponsored && (
                <span className="badge bg-danger me-1">Sponsored</span>
              )}
              {data.featured && (
                <span className="badge bg-warning text-dark me-1">Best Seller</span>
              )}
            </div>

            {/* CATEGORY */}
            <div className="text-muted mb-2">
              {Array.isArray(data.categories) && data.categories.length > 0
                ? data.categories.join(", ")
                : "No Category"}
            </div>

            {/* RATING */}
            <div className="d-flex align-items-center mb-3">
              {renderStars(Math.round(averageRating))}
              <span className="ms-2 fw-bold">
                {averageRating.toFixed(1)} / 5
                <span className="text-muted"> ({reviews.length} reviews)</span>
              </span>
            </div>

            {/* PRICE */}
            <h3 className="mb-3">
              {offerActive ? (
                <>
                  <span className="text-muted text-decoration-line-through me-2">
                    ₹{data.mrp}
                  </span>
                  <span className="text-success fw-bold">₹{data.sellingPrice}</span>
                </>
              ) : (
                <span className="fw-bold">₹{data.sellingPrice}</span>
              )}
            </h3>

            <p className="lead">{data.description}</p>

            {/* STOCK */}
            {data.stock > 0 ? (
              <p className="text-muted mb-2">
                <strong>{data.stock}</strong> items left in stock
              </p>
            ) : (
              <p className="text-danger fw-bold mb-2">Out of Stock</p>
            )}

            <button
              disabled={!data.stock || data.stock === 0}
              className="btn btn-dark btn-lg mt-2"
              onClick={addToCart}
            >
              {data.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>

        {/* REVIEWS & PAGINATION could go here if needed */}
      </div>

      {/* IMAGE MODAL */}
      {activeImage && (
        <div className="img-modal" onClick={() => setActiveImage(null)}>
          <img src={activeImage} className="img-modal-content" alt="zoom" />
        </div>
      )}
    </section>
  );
};

export default FoodDetails;
