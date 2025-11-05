import React, { useState, useEffect } from "react";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import { fetchCategories } from "../../service/CategoryService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ExploreFood.css"; 

const ExploreFood = () => {
  const [category, setCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState([]);
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    const loadCategories = async () => {

      try {
        const res = await fetchCategories();
        const categoryNames = res.data.map((cat) => cat.name);
        setCategories(["All", ...categoryNames]);
      } catch (err) {
        toast.error("Failed to fetch categories");
      }
    };
    loadCategories();
  }, []);

  const handleSearchSubmit = (e) => e.preventDefault();

  return (
    <div className="container mt-5 explore-container">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold text-gradient">Explore Delicious Foods 🍽️</h2>
        <p className="text-muted">
          Filter by category, search your favorite dishes, or sort by price/order popularity.
        </p>
      </div>

      {/* Filters Section */}
      <form onSubmit={handleSearchSubmit} className="filter-bar shadow-sm p-4 rounded-4">
        <div className="row align-items-center gy-3">
          {/* Category Selector */}
          <div className="col-md-3">
            <label className="form-label fw-semibold">Category</label>
            <select
              className="form-select rounded-pill"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="col-md-5">
            <label className="form-label fw-semibold">Search</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control rounded-start-pill"
                placeholder="Search your favourite dish..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button className="btn btn-primary rounded-end-pill" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>

          {/* Sort Option */}
          <div className="col-md-3">
            <label className="form-label fw-semibold">Sort By</label>
            <select
              className="form-select rounded-pill"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="highlyOrdered">Highly Ordered</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </form>

      {/* Food Display */}
      <div className="mt-5">
        <FoodDisplay category={category} searchText={searchText} sortOption={sortOption} />
      </div>
    </div>
  );
};

export default ExploreFood;
