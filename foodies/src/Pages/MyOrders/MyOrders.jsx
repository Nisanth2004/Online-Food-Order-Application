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
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // UTILITY HELPERS
  const normalizeStatus = (raw) => (raw ? String(raw).trim().toUpperCase() : "");
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

  // LOAD ORDERS
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

  // CANCEL REQUEST
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
                err.response?.data?.message || "Failed to request cancellation"
              );
            }
          },
        },
        { label: "No", onClick: () => {} },
      ],
    });
  };

  useEffect(() => {
    if (!token) return;
    fetchOrders();
    const id = setInterval(fetchOrders, 10000);
    return () => clearInterval(id);
  }, [token]);

  // FILTERS & SEARCH
  const filteredOrders = useMemo(() => {
    let filtered = [...data];

    filtered.sort(
      (a, b) =>
        new Date(getOrderDate(b) || 0) - new Date(getOrderDate(a) || 0)
    );

    if (statusFilter !== "All") {
      const normFilter = normalizeStatus(statusFilter);
      filtered = filtered.filter(
        (o) => normalizeStatus(o.orderStatus) === normFilter
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((order) => {
        const matchName =
          Array.isArray(order.orderedItems) &&
          order.orderedItems.some((item) =>
            String(item.name || "").toLowerCase().includes(q)
          );
        const matchAddress = String(order.userAddress || "")
          .toLowerCase()
          .includes(q);
        const matchPincode = String(order.pincode || "")
          .toLowerCase()
          .includes(q);
        return matchName || matchAddress || matchPincode;
      });
    }

    const min = minPrice !== "" ? parseFloat(minPrice) : null;
    const max = maxPrice !== "" ? parseFloat(maxPrice) : null;

    if (min !== null || max !== null) {
      filtered = filtered.filter((o) => {
        const amt = Number(o.amount) || 0;
        if (min !== null && max !== null) return amt >= min && amt <= max;
        if (min !== null) return amt >= min;
        if (max !== null) return amt <= max;
        return true;
      });
    }

    return filtered;
  }, [data, statusFilter, search, minPrice, maxPrice]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / itemsPerPage)
  );
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // MODAL OPEN
  const openModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const navigateToOrderPage = (id) => {
    closeModal();
    navigate(`/orders/${id}`);
  };

  return (
    <div className="container py-5 my-orders-container">
      {/* ---------------- Desktop Table ---------------- */}
      <div className="d-none d-md-block">
        <div className="card p-3 shadow-sm">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Total Items</th>
                <th>Track</th>
                <th>Order Time</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted p-3">
                    No matching orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                  <tr
                    key={order.id || index}
                    onClick={() => openModal(order)}
                    className={
                      normalizeStatus(order.orderStatus) === "CANCELLED"
                        ? "cancelled-row"
                        : ""
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <img
                        src={assets.delivery}
                        height={48}
                        width={48}
                        alt="order"
                      />
                    </td>

                    <td>
                      {(order.orderedItems || [])
                        .map((i) => `${i.name} x${i.quantity}`)
                        .join(", ")}
                    </td>

                    <td>₹{Number(order.amount).toFixed(2)}</td>
                    <td>{(order.orderedItems || []).length}</td>

                <td>
  <i
    className="bi bi-geo-alt-fill track-icon"
    title="Track Order"
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/orders/track/${order.id}`);
    }}
  ></i>
</td>


                    <td>
                      {new Date(getOrderDate(order) || 0).toLocaleString()}
                    </td>

                    <td>
                      <div
                        className="d-flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchOrders();
                          }}
                        >
                          <i className="bi bi-arrow-clockwise"></i>
                        </button>

                        {normalizeStatus(order.orderStatus) !== "DELIVERED" &&
                          normalizeStatus(order.orderStatus) !== "CANCELLED" && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelOrder(order.id);
                              }}
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- Mobile Cards ---------------- */}
      <div className="d-md-none">
        {paginatedOrders.length === 0 ? (
          <p className="text-muted text-center mt-4">
            No matching orders found
          </p>
        ) : (
          paginatedOrders.map((order, index) => (
            <div
              key={order.id || index}
              className={`card mb-3 shadow-sm ${
                normalizeStatus(order.orderStatus) === "CANCELLED"
                  ? "cancelled-row"
                  : ""
              }`}
              onClick={() => openModal(order)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <img
                    src={assets.delivery}
                    height={45}
                    width={45}
                    alt="order"
                  />

                  <span
                    className={`status-badge status-${cssStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {getDisplayStatus(order.orderStatus)}
                  </span>
                </div>

                <p className="mb-1">
                  <strong>Items:</strong>{" "}
                  {(order.orderedItems || [])
                    .map((i) => `${i.name} x${i.quantity}`)
                    .join(", ")}
                </p>

                <p className="mb-1">
                  <strong>Amount:</strong> ₹{Number(order.amount).toFixed(2)}
                </p>

                <p className="mb-1">
                  <strong>Ordered On:</strong>{" "}
                  {new Date(getOrderDate(order) || 0).toLocaleString()}
                </p>

                <div
                  className="d-flex justify-content-end gap-2 mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                <button
  className="track-btn w-100 mb-2"
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/orders/track/${order.id}`);
  }}
>
  <i className="bi bi-geo-alt-fill"></i> Track Order
</button>

{normalizeStatus(order.orderStatus) !== "DELIVERED" &&
 normalizeStatus(order.orderStatus) !== "CANCELLED" && (
  <button
    className="btn btn-sm btn-danger w-100"
    onClick={(e) => {
      e.stopPropagation();
      cancelOrder(order.id);
    }}
  >
    <i className="bi bi-x-circle"></i> Cancel Order
  </button>
)}

                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ---------------- Pagination ---------------- */}
      {totalPages > 1 && (
        <div className="pagination-controls mt-4 text-center">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>

          <span className="mx-3">
            <strong>{currentPage}</strong> / {totalPages}
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

      {/* ---------------- MODAL ---------------- */}
     
    </div>
  );
};

export default MyOrders;
