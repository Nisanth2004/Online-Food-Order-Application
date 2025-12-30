import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import { fetchCategories } from "../../service/CategoryService";
import {
  fetchBestSellers,
  fetchTopSelling,
  fetchFeaturedFoods,
} from "../../service/foodService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ExploreFood.css";

const ExploreFood = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type"); // 👈 NEW

  const [category, setCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [specialFoods, setSpecialFoods] = useState(null); // 👈 NEW

  /* Load categories */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        const categoryNames = res.data.map(cat => cat.name);
        setCategories(["All", ...categoryNames]);
      } catch {
        toast.error("Failed to fetch categories");
      }
    };
    loadCategories();
  }, []);

  /* Load special foods based on menu click */
  useEffect(() => {
    const loadSpecialFoods = async () => {
      try {
        if (type === "best-sellers") {
          setSpecialFoods(await fetchBestSellers());
        } else if (type === "top-selling") {
          setSpecialFoods(await fetchTopSelling());
        } else if (type === "featured") {
          setSpecialFoods(await fetchFeaturedFoods());
        } else {
          setSpecialFoods(null); // normal explore
        }
      } catch {
        toast.error("Failed to load foods");
      }
    };
    loadSpecialFoods();
  }, [type]);

  const handleSearchSubmit = e => e.preventDefault();

  const getTitle = () => {
    if (type === "best-sellers") return "🔥 Best Sellers";
    if (type === "top-selling") return "🏆 Top Selling";
    if (type === "featured") return "⭐ Featured Foods";
    return "Explore Delicious Foods 🍽️";
  };

  return (
    <div className="container mt-4 explore-container px-3">

      {/* HEADER */}
      <div className="text-center mb-4">
        <h2 className="fw-bold text-gradient fs-5 fs-md-2">
          {getTitle()}
        </h2>
        <p className="text-muted fs-6">
          Filter by category, search dishes, or sort easily.
        </p>
      </div>

      {/* FILTERS */}
      <form
        onSubmit={handleSearchSubmit}
        className="filter-bar shadow-sm p-3 p-md-4 rounded-4"
      >
        <div className="row gy-3">

          {/* CATEGORY */}
          <div className="col-12 col-md-4">
            <label className="form-label fw-semibold small">Category</label>
            <select
              className="form-select rounded-pill"
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={!!type}   // 👈 disable for specials
            >
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* SEARCH */}
          <div className="col-12 col-md-5">
            <label className="form-label fw-semibold small">Search</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control rounded-start-pill"
                placeholder="Search your favourite dish..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
              <button className="btn btn-primary rounded-end-pill" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>

          {/* SORT */}
          <div className="col-12 col-md-3">
            <label className="form-label fw-semibold small">Sort By</label>
            <select
              className="form-select rounded-pill"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="highlyOrdered">Highly Ordered</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </form>

      {/* FOOD DISPLAY */}
      <div className="mt-4 mb-5">
        <FoodDisplay
          category={category}
          searchText={searchText}
          sortOption={sortOption}
          foods={specialFoods}   // 👈 NEW
        />
      </div>
    </div>
  );
};

export default ExploreFood;
