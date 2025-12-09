import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import { fetchFoodList } from "../../service/FoodService";
import "./FoodDisplay.css";

const FoodDisplay = ({ category, searchText, sortOption }) => {
  const { foodList, setFoodList } = useContext(StoreContext);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadFoods = async (pageNumber = 0) => {
    try {
      setLoading(true);

      const data = await fetchFoodList(
        pageNumber,
        15,
        category,
        searchText,
        sortOption
      );

      setFoodList(data.foods || []);
      setTotalPages(data.totalPages || 1);
      setPage(pageNumber);
    } catch (error) {
      console.error("Failed to load foods:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reload when filters change
  useEffect(() => {
    loadFoods(0);
  }, [category, searchText, sortOption]);

  return (
    <div className="container">
      {loading && <p className="text-center">Loading...</p>}

      <p className="text-center text-muted">
        Page {page + 1} of {totalPages}
      </p>

      <div className="row">
        {foodList.length > 0 ? (
          foodList.map((food) => (
            <FoodItem
              key={food.id}
              id={food.id}
              name={food.name}
              description={food.description}
              price={food.price}
              imageUrl={food.imageUrl}
              sponsored={food.sponsored}
              featured={food.featured}
              averageRating={food.averageRating}
              reviewCount={food.reviewCount}
              stock={food.stock}
              categories={food.categories} 
            />
          ))
        ) : (
          !loading && (
            <div className="text-center mt-4">
              <h4>No foods found</h4>
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      <div className="pagination-container mt-5">
        <button
          className="pagination-btn"
          onClick={() => loadFoods(page - 1)}
          disabled={page === 0 || loading}
        >
          ‹ Previous
        </button>

        <div className="pagination-pages">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`page-number ${index === page ? "active" : ""}`}
              onClick={() => loadFoods(index)}
              disabled={loading}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          className="pagination-btn"
          onClick={() => loadFoods(page + 1)}
          disabled={page + 1 >= totalPages || loading}
        >
          Next ›
        </button>
      </div>
    </div>
  );
};

export default FoodDisplay;
