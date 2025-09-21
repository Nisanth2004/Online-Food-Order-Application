import React, { useState, useEffect } from "react";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import { fetchCategories } from "../../service/CategoryService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExploreFood = () => {
  const [category, setCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState([]);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center mb-4">
        <div className="col-md-8 col-lg-6">
          <form onSubmit={handleSearchSubmit}>
            <div className="input-group shadow-sm p-2 rounded">
              <select
                className="form-select"
                style={{ maxWidth: "120px" }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <input
                type="text"
                className="form-control"
                placeholder="Search your favourite dish..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />

              <button className="btn btn-primary" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      <FoodDisplay category={category} searchText={searchText} />
    </div>
  );
};

export default ExploreFood;
