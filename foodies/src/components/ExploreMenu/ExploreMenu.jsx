import React, { useEffect, useRef, useState } from "react";
import { fetchCategories } from "../../service/CategoryService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ExploreMenu.css";

const ExploreMenu = ({ category, setCategory }) => {
  const menuRef = useRef(null);
  const [categories, setCategories] = useState([]);

  // fetch categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        const dbCategories = res.data.map((cat) => cat.name);
        setCategories(["All", ...dbCategories]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load categories");
      }
    };
    loadCategories();
  }, []);

  const scrollLeft = () => {
    if (menuRef.current) {
      menuRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (menuRef.current) {
      menuRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="explore-menu position-relative">
      <h1 className="d-flex align-items-center justify-content-between">
        Explore Our Menu
        <div className="d-flex">
          <i
            className="bi bi-arrow-left-circle scroll-icon"
            onClick={scrollLeft}
          ></i>
          <i
            className="bi bi-arrow-right-circle scroll-icon"
            onClick={scrollRight}
          ></i>
        </div>
      </h1>
      <p>Explore curated lists of items from our categories</p>
      <div
        className="d-flex justify-content-start gap-3 overflow-auto explore-menu-list"
        ref={menuRef}
      >
        {categories.map((item, index) => (
          <div
            key={index}
            className="text-center explore-menu-list-item"
            onClick={() => setCategory((prev) => (prev === item ? "All" : item))}
          >
            <div className={`category-box ${item === category ? "active" : ""}`}>
              <p>{item}</p>
            </div>
          </div>
        ))}
      </div>
      <hr />
      
    </div>
  );
};

export default ExploreMenu;
