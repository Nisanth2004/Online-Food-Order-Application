import React, { useContext, useEffect, useState, useMemo } from "react";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";
import "./MyOrders.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import api from "../../service/CustomAxiosInstance";

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // ✅ Fetch all user orders
  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/orders/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  // ✅ Cancel order request
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
              toast.success("Cancel request sent to admin.", {
                position: "top-center",
              });
              fetchOrders();
            } catch (error) {
              toast.error(
                error.response?.data?.message || "Failed to request cancellation",
                { position: "top-center" }
              );
            }
          },
        },
        { label: "No", onClick: () => {} },
      ],
    });
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const formatOrderDate = (isoDate) =>
    isoDate ? new Date(isoDate).toLocaleString() : "—";

  // ✅ Map status
  const getDisplayStatus = (status) => {
    switch (status) {
      case "PREPARING":
        return "👨‍🍳 In Kitchen";
      case "OUT_FOR_DELIVERY":
        return "🚚 Out For Delivery";
      case "DELIVERED":
        return "✅ Delivered";
      case "CANCELLED":
        return "❌ Cancelled";
      case "CANCEL_REQUESTED":
        return "⏳ Cancel Requested";
      case "PENDING":
        return "🕒 Pending";
      case "CONFIRMED":
        return "📝 Confirmed";
      default:
        return "🗂 Unknown";
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...data];
    filtered.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    if (statusFilter !== "All")
      filtered = filtered.filter((o) => o.orderStatus === statusFilter);

    if (search.trim())
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

    if (minPrice && maxPrice)
      filtered = filtered.filter(
        (o) => o.amount >= minPrice && o.amount <= maxPrice
      );

    return filtered;
  }, [data, statusFilter, search, minPrice, maxPrice]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setStatusFilter("All");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="container py-5 my-orders-container">
      {/* Filters Section */}
      <div className="filters row mb-4 gx-3 gy-2 align-items-end">
        <div className="col-md-2 col-6">
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="PREPARING">In Kitchen</option>
            <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="CANCEL_REQUESTED">Cancel Requested</option>
          </select>
        </div>

        <div className="col-md-3 col-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by food, pincode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-3 col-12 d-flex">
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

        <div className="col-md-2 col-12 d-grid mt-2 mt-md-0">
          <button className="btn btn-secondary" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="d-none d-md-block">
        <div className="card p-3 shadow-sm">
          <table className="table table-hover">
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
                  <td colSpan="7" className="text-center text-muted p-3">
                    No matching orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => (
                  <tr
                    key={index}
                    className={
                      order.orderStatus === "CANCELLED" ? "cancelled-row" : ""
                    }
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
                      {order.orderedItems
                        .map((item) => `${item.name} x${item.quantity}`)
                        .join(", ")}
                    </td>
                    <td>₹{order.amount.toFixed(2)}</td>
                    <td>{order.orderedItems.length}</td>
                    <td>
                      <span
                        className={`status-badge status-${order.orderStatus.toLowerCase()}`}
                      >
                        {getDisplayStatus(order.orderStatus)}
                      </span>
                    </td>
                    <td>{formatOrderDate(order.createdDate)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={fetchOrders}
                          title="Refresh"
                        >
                          <i className="bi bi-arrow-clockwise"></i>
                        </button>

                        {order.orderStatus !== "DELIVERED" &&
                          order.orderStatus !== "CANCELLED" && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => cancelOrder(order.id)}
                              title="Cancel Order"
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

      {/* Mobile Cards */}
      <div className="d-md-none">
        {paginatedOrders.length === 0 ? (
          <p className="text-center text-muted mt-3">No matching orders found</p>
        ) : (
          paginatedOrders.map((order, index) => (
            <div
              className={`card mb-3 shadow-sm ${
                order.orderStatus === "CANCELLED" ? "cancelled-row" : ""
              }`}
              key={index}
            >
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <img
                    src={assets.delivery}
                    height={45}
                    width={45}
                    alt="order"
                    className="me-2"
                  />
                  <span
                    className={`status-badge status-${order.orderStatus.toLowerCase()}`}
                  >
                    {getDisplayStatus(order.orderStatus)}
                  </span>
                </div>
                <p className="mb-1">
                  <strong>Items:</strong>{" "}
                  {order.orderedItems
                    .map((item) => `${item.name} x${item.quantity}`)
                    .join(", ")}
                </p>
                <p className="mb-1">
                  <strong>Amount:</strong> ₹{order.amount.toFixed(2)}
                </p>
                <p className="mb-1">
                  <strong>Ordered On:</strong> {formatOrderDate(order.createdDate)}
                </p>
                <div className="d-flex justify-content-end gap-2 mt-2">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={fetchOrders}
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                  {order.orderStatus !== "DELIVERED" &&
                    order.orderStatus !== "CANCELLED" && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => cancelOrder(order.id)}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
 {totalPages > 1 && (
  <div className="pagination-controls mt-4 text-center">
    <div className="pagination-wrapper d-inline-flex align-items-center gap-2">
      <button
        className="pagination-btn"
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
      >
        ← Prev
      </button>

      <div className="pagination-pages">
        <span className="page-info">
          <strong>{currentPage}</strong>
          <span className="page-separator"> / {totalPages}</span>
        </span>
      </div>

      <button
        className="pagination-btn"
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Next →
      </button>
    </div>
  </div>
)}


    </div>
  );
};

export default MyOrders;
