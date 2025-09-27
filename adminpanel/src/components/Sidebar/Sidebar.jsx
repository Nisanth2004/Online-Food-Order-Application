import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { fetchCategories, deleteCategory } from '../../services/CategoryService';
import { toast } from 'react-toastify';

const Sidebar = ({ sidebarVisible, setCategory }) => {
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div
      className={`border-end bg-white ${sidebarVisible ? '' : 'd-none'}`}
      id="sidebar-wrapper"
    >
      <div className="sidebar-heading border-bottom bg-light text-center">
        <img src={assets.logo5} alt="SN" height={70} width={70} />
      </div>

      <div className="list-group list-group-flush">
        <Link
          className="list-group-item list-group-item-action list-group-item-light p-3"
          to="/add"
        >
          <i className="bi bi-plus-circle me-2"></i>Add Food
        </Link>
        <Link
          className="list-group-item list-group-item-action list-group-item-light p-3"
          to="/list"
        >
          <i className="bi bi-list-ul me-2"></i>List Foods
        </Link>
        <Link
          className="list-group-item list-group-item-action list-group-item-light p-3"
          to="/orders"
        >
          <i className="bi bi-cart me-2"></i>Orders
        </Link>
        <Link
          className="list-group-item list-group-item-action list-group-item-light p-3"
          to="/reviews"
        >
          <i className="bi bi-star me-2"></i> Reviews
        </Link>

        <hr />

        <h6 className="px-3 mt-2">Categories</h6>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="d-flex justify-content-between align-items-center list-group-item list-group-item-light p-3"
          >
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setCategory(cat.name)}
            >
              {cat.name} ({cat.foodCount})
            </span>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(cat.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
