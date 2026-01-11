import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { fetchCategories, deleteCategory } from '../../services/CategoryService';
import { toast } from 'react-toastify';

const Sidebar = ({ sidebarVisible, setCategory }) => {
  const [categories, setCategories] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // modal state
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    navigate("/admin/login");
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
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/stock-dashboard">
          <i className="bi bi-bar-chart"></i> Stock Dashboard
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/add">
          <i className="bi bi-plus-circle me-2"></i>Add Food
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/list">
          <i className="bi bi-list-ul me-2"></i>List Foods
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/offers">
          <i className="bi bi-tags me-2"></i> Offers & Promotions
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/stock-management">
          <i className="bi bi-box-seam me-2"></i>Stock Management
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/orders">
          <i className="bi bi-cart me-2"></i>Orders
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/reviews">
          <i className="bi bi-star me-2"></i>Reviews
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/admin-cancel-requests">
          <i className="bi bi-x-circle me-2"></i>Cancel Requests
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/logs">
          <i className="bi bi-clock-history"></i> Stock Logs
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/analytics">
          <i className="bi bi-graph-up"></i> Analytics
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/customers">
          <i className="bi bi-people"></i> Our Customers
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/courier">
          <i className="bi bi-truck"></i> Courier Companies
        </Link>
        <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/settings">
          <i className="bi bi-gear me-2"></i> Settings
        </Link>

         <Link className="list-group-item list-group-item-action list-group-item-light p-3" to="/admin/vendors">
          <i className="bi bi-gear me-2"></i> Vendors
        </Link>
  <span
          className="list-group-item list-group-item-action list-group-item-light text-danger fw-bold"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowLogoutModal(true)}
        >
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </span>
        <hr />

        {/* ✅ LOGOUT LINK WITH MODAL */}
      

        {/* CATEGORY LIST */}
        <h6 className="px-3 mt-3">Categories</h6>
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

      {/* ===== CUSTOM MODAL ===== */}
      {showLogoutModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Logout</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLogoutModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to logout?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleLogout}
                >
                  Confirm Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sidebar;
