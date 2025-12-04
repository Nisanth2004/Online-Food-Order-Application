import React, { useContext, useEffect, useState, useMemo } from "react";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";
import "./MyOrders.css";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import api from "../../service/CustomAxiosInstance";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Helpers
  const normalizeStatus = (raw) =>
    raw ? String(raw).trim().toUpperCase() : "";
  const stripOrderPrefix = (raw) =>
    normalizeStatus(raw).replace(/^ORDER_/, "");
  const cssStatusClass = (raw) =>
    stripOrderPrefix(raw).replace(/_/g, "-").toLowerCase();
  const getOrderDate = (o) =>
    o.createdDate || o.createdAt || o.createdOn || null;

  const getDisplayStatus = (status) => {
    const s = stripOrderPrefix(status);
    switch (s) {
      case "PLACED": return "🛒 Order Placed";
      case "CONFIRMED": return "✅ Confirmed";
      case "PACKED": return "📦 Packed";
      case "SHIPPED": return "🚚 Shipped";
      case "OUT_FOR_DELIVERY": return "🏠 Out For Delivery";
      case "DELIVERED": return "🎉 Delivered";
      case "CANCELLED": return "❌ Cancelled";
      case "CANCEL_REQUESTED": return "⏳ Cancel Requested";
      default: return status || "Unknown Status";
    }
  };

  // Load Orders
  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/orders/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel Request
  const cancelOrder = async (orderId) => {
    confirmAlert({
      title: "Cancel Order?",
      message: "Your cancel request will be sent to admin for approval.",
      buttons: [
        {
          label: "Yes, Request Cancel",
          onClick: async () => {
            try {
              await api.patch(
                `/api/orders/${orderId}/request-cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              toast.success("Cancel request sent to admin.");
              fetchOrders();
            } catch (err) {
              toast.error(
                err.response?.data?.message ||
                  "Failed to request cancellation"
              );
            }
          },
        },
        { label: "No" },
      ],
    });
  };

  useEffect(() => {
    if (!token) return;
    fetchOrders();
    const id = setInterval(fetchOrders, 10000);
    return () => clearInterval(id);
  }, [token]);

  // Filtering
  const filteredOrders = useMemo(() => {
    let filtered = [...data];

    filtered.sort(
      (a, b) =>
        new Date(getOrderDate(b) || 0) -
        new Date(getOrderDate(a) || 0)
    );

    // Status Filter
    if (statusFilter !== "All") {
      const norm = normalizeStatus(statusFilter);
      filtered = filtered.filter(
        (o) => normalizeStatus(o.orderStatus) === norm
      );
    }

    // Search Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((order) => {
        const matchName =
          Array.isArray(order.orderedItems) &&
          order.orderedItems.some((item) =>
            String(item.name || "")
              .toLowerCase()
              .includes(q)
          );

        const matchAddress = String(order.userAddress || "")
          .toLowerCase()
          .includes(q);

        return matchName || matchAddress;
      });
    }

    // Date Range Filter
    if (fromDate || toDate) {
      filtered = filtered.filter((o) => {
        const od = new Date(getOrderDate(o));
        if (fromDate && od < new Date(fromDate)) return false;
        if (toDate && od > new Date(toDate)) return false;
        return true;
      });
    }

    // Price Filter
    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;

    if (min !== null || max !== null) {
      filtered = filtered.filter((o) => {
        const amt = Number(o.amount) || 0;
        if (min !== null && amt < min) return false;
        if (max !== null && amt > max) return false;
        return true;
      });
    }

    return filtered;
  }, [data, statusFilter, search, fromDate, toDate, minPrice, maxPrice]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / itemsPerPage)
  );
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="container py-5 my-orders-container">

      {/* ---------------- Filter Panel ---------------- */}
      <div className="filter-panel mb-4 p-3 shadow-sm">

        <div className="row g-3">
          {/* Status */}
          <div className="col-md-3">
            <label>Status</label>
            <select
  className="form-select"
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="All">All</option>
  <option value="ORDER_PLACED">Order Placed</option>
  <option value="ORDER_CONFIRMED">Order Confirmed</option>
  <option value="ORDER_PACKED">Packed</option>
  <option value="SHIPPED">Shipped</option>
  <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
  <option value="DELIVERED">Delivered</option>
  <option value="CANCELLED">Cancelled</option>
  <option value="CANCEL_REQUESTED">Cancel Requested</option>
</select>

          </div>

          {/* Search */}
          <div className="col-md-3">
            <label>Search by Name / Address</label>
            <input
              className="form-control"
              placeholder="e.g. Biriyani, street name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* From Date */}
          <div className="col-md-3">
            <label>From Date</label>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div className="col-md-3">
            <label>To Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Price Min */}
          <div className="col-md-3">
            <label>Min Price</label>
            <input
              type="number"
              className="form-control"
              value={minPrice}
              onChange={(e) =>
                setMinPrice(e.target.value)
              }
            />
          </div>

          {/* Price Max */}
          <div className="col-md-3">
            <label>Max Price</label>
            <input
              type="number"
              className="form-control"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* ---------------- Desktop Table ---------------- */}
      <div className="d-none d-md-block">
        <table className="table table-hover shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Image</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Total Items</th>
              <th>Status</th>
              <th>Order Time</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-3 text-muted">
                  No orders found
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
                const isDelivered =
                  normalizeStatus(order.orderStatus) ===
                  "DELIVERED";

                return (
                  <tr
                    key={order.id}
                    className={isDelivered ? "delivered-row" : ""}
                    onClick={() => openModal(order)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <img
                        src={assets.delivery}
                        width={48}
                        height={48}
                      />
                    </td>

                    <td>
                      {(order.orderedItems || [])
                        .map(
                          (i) => `${i.name} x${i.quantity}`
                        )
                        .join(", ")}
                    </td>

                    <td>₹{order.amount}</td>
                    <td>
                      {(order.orderedItems || []).length}
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${cssStatusClass(
                          order.orderStatus
                        )}`}
                      >
                        {getDisplayStatus(order.orderStatus)}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        getOrderDate(order)
                      ).toLocaleString()}
                    </td>

                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() =>
                          navigate(
                            `/orders/track/${order.id}`
                          )
                        }
                      >
                        Track
                      </button>

                      {normalizeStatus(
                        order.orderStatus
                      ) !== "DELIVERED" &&
                        normalizeStatus(
                          order.orderStatus
                        ) !== "CANCELLED" && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              cancelOrder(order.id)
                            }
                          >
                            Cancel
                          </button>
                        )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- Mobile Cards ---------------- */}
      <div className="d-md-none">
        {paginatedOrders.length === 0 ? (
          <p className="text-center mt-3 text-muted">
            No orders found
          </p>
        ) : (
          paginatedOrders.map((order) => {
            const isDelivered =
              normalizeStatus(order.orderStatus) ===
              "DELIVERED";

            return (
              <div
                key={order.id}
                className={`order-card shadow-sm mb-3 ${
                  isDelivered ? "delivered-row" : ""
                }`}
                onClick={() => openModal(order)}
              >
                <div className="d-flex justify-content-between">
                  <img
                    src={assets.delivery}
                    width={45}
                    height={45}
                  />

                  <span
                    className={`status-badge status-${cssStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {getDisplayStatus(order.orderStatus)}
                  </span>
                </div>

                <p className="mt-2">
                  <strong>Items:</strong>{" "}
                  {(order.orderedItems || [])
                    .map(
                      (i) => `${i.name} x${i.quantity}`
                    )
                    .join(", ")}
                </p>

                <p>
                  <strong>Amount:</strong> ₹{order.amount}
                </p>

                <p>
                  <strong>Ordered On:</strong>{" "}
                  {new Date(
                    getOrderDate(order)
                  ).toLocaleString()}
                </p>

                <div
                  className="d-flex gap-2 mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn btn-sm btn-outline-primary w-100"
                    onClick={() =>
                      navigate(
                        `/orders/track/${order.id}`
                      )
                    }
                  >
                    Track
                  </button>

                  {normalizeStatus(
                    order.orderStatus
                  ) !== "DELIVERED" &&
                    normalizeStatus(
                      order.orderStatus
                    ) !== "CANCELLED" && (
                      <button
                        className="btn btn-sm btn-danger w-100"
                        onClick={() =>
                          cancelOrder(order.id)
                        }
                      >
                        Cancel
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ---------------- Pagination ---------------- */}
      {totalPages > 1 && (
        <div className="pagination-controls mt-4 text-center">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((p) => Math.max(1, p - 1))
            }
          >
            ← Prev
          </button>

          <span className="mx-3">
            {currentPage} / {totalPages}
          </span>

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
