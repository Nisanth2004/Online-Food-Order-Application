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
      if (err.response?.status === 409) {
        toast.error("This category still has foods. Remove them before deleting.");
      } else {
        toast.error(err.response?.data?.message || "Failed to delete category");
      }
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

        {/* MAIN MENU */}

      <Link
          className="list-group-item list-group-item-action list-group-item-light p-3"
          to="/admin/stock-dashboard"
        >
         <i className="bi bi-bar-chart"></i> Stock Dashboard
        </Link>

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

        {/* NEW – STOCK MANAGEMENT */}
        <Link
          className="list-group-item list-group-item-action list-group-item-light p-3"
          to="/stock-management"
        >
          <i className="bi bi-box-seam me-2"></i>Stock Management
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
          <i className="bi bi-star me-2"></i>Reviews
        </Link>

        <Link
          className="list-group-item list-group-item-action list-group-item-light p-3"
          to="/admin-cancel-requests"
        >
          <i className="bi bi-x-circle me-2"></i>Cancel Requests
        </Link>

          <Link
          className="list-group-item list-group-item-action list-group-item-light p-3"
          to="/logs"
        >
           <i className="bi bi-clock-history"></i> Stock Logs
        </Link>

          <Link
          className="list-group-item list-group-item-action list-group-item-light p-3"
          to="/analytics"
        >
           <i className="bi bi-graph-up"></i> Analytics
        </Link>

        <hr />

        {/* CATEGORY LIST */}
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
