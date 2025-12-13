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
      const data = await fetchFoodList(pageNumber, 15, category, searchText, sortOption);
      setFoodList(data.foods || []);
      setTotalPages(data.totalPages || 1);
      setPage(pageNumber);
    } catch (error) {
      console.error("Failed to load foods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods(0);
  }, [category, searchText, sortOption]);

  return (
    <div className="container">
      {loading && <p className="text-center">Loading...</p>}
      {!loading && foodList.length === 0 && <p className="text-center mt-4">No foods found</p>}

      <div className="row">
        {foodList.map((food) => (
          <FoodItem
            key={food.id}
            id={food.id}
            name={food.name}
            description={food.description}
            imageUrl={food.imageUrl}
            mrp={food.mrp}
            sellingPrice={food.sellingPrice}
            offerLabel={food.offerLabel}
            sponsored={food.sponsored}
            featured={food.featured}
            stock={food.stock}
            categories={food.categories}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container mt-4 text-center">
          <button
            className="pagination-btn"
            onClick={() => loadFoods(page - 1)}
            disabled={page === 0 || loading}
          >
            ‹ Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`page-number ${i === page ? "active" : ""}`}
              onClick={() => loadFoods(i)}
              disabled={loading}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="pagination-btn"
            onClick={() => loadFoods(page + 1)}
            disabled={page + 1 >= totalPages || loading}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;
