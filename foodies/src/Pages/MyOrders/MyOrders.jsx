import React, { useContext, useEffect, useState, useMemo } from "react";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import "./MyOrders.css";

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const calculateOrderTime = (date) => {
    if (!date) return "—";
    const orderDate = new Date(date);
    const now = new Date();
    const diffMs = now - orderDate;

    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMinutes > 0) return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };
const formatOrderDate = (isoDate) => {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleString(); // e.g., 26/09/2025, 6:30 PM
};

  // ✅ Filtering + Sorting (Latest first)
  const filteredOrders = useMemo(() => {
    let filtered = [...data];

    // Sort: latest first
    filtered.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    // Search filter (food name, address, pincode)
    if (search.trim() !== "") {
      filtered = filtered.filter((order) => {
        const matchName = order.orderedItems.some((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        );
        const matchAddress = order.userAddress
          ?.toLowerCase()
          .includes(search.toLowerCase());
        const matchPincode = order.pincode
          ?.toString()
          .includes(search.toLowerCase());
        return matchName || matchAddress || matchPincode;
      });
    }

    // Price range filter
    if (minPrice !== "" && maxPrice !== "") {
      filtered = filtered.filter(
        (order) => order.amount >= minPrice && order.amount <= maxPrice
      );
    }

    return filtered;
  }, [data, statusFilter, search, minPrice, maxPrice]);

  // Reset all filters to default
  const resetFilters = () => {
    setStatusFilter("All");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="container py-5">
      {/* Filters Section */}
      <div className="filters row mb-4 gx-3 gy-2 align-items-end">
        <div className="col-md-2">
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="In Kitchen">In Kitchen</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by food, pincode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3 d-flex">
          <input
            type="number"
            className="form-control me-2"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            className="form-control"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-secondary" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
        
      </div>

      {/* Orders Table */}
      <div className="row justify-content-center">
        <div className="col-11 card p-3 shadow-sm">
          <table className="table table-hover table-responsive">
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Total Items</th>
                <th>Status</th>
                <th>Order Time</th>
                <th>Refresh</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted p-3">
                    No matching orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={index}>
                    <td className="align-middle">
                      <img src={assets.delivery} height={48} width={48} />
                    </td>
                    <td className="align-middle">
                      {order.orderedItems.map((item, idx) =>
                        idx === order.orderedItems.length - 1
                          ? `${item.name} x${item.quantity}`
                          : `${item.name} x${item.quantity}, `
                      )}
                    </td>
                    <td className="align-middle">&#x20B9;{order.amount.toFixed(2)}</td>
                    <td className="align-middle">{order.orderedItems.length}</td>
                    <td className="align-middle fw-bold text-capitalize">
                      &#x25cf; {order.orderStatus}
                    </td>
                  <td className="align-middle">{formatOrderDate(order.createdDate)}</td>

                    <td className="align-middle">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={fetchOrders}
                      >
                        <i className="bi bi-arrow-clockwise"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
