import React, { useContext, useEffect, useState, useMemo } from "react";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import "./MyOrders.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

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

 const cancelOrder = async (orderId) => {
  confirmAlert({
    title: "Cancel Order?",
    message: "Your cancel request will be sent to admin for approval.",
    buttons: [
      {
        label: "Yes, Request Cancel",
        onClick: async () => {
          try {
            await axios.patch(
             `http://localhost:8080/api/orders/${orderId}/request-cancel`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(
              "Your cancel request has been sent to admin. Check status in orders page.",
              { position: "top-center" }
            );
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

  const formatOrderDate = (isoDate) => {
    if (!isoDate) return "—";
    return new Date(isoDate).toLocaleString();
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...data];
    filtered.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

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

    if (minPrice !== "" && maxPrice !== "") {
      filtered = filtered.filter(
        (order) => order.amount >= minPrice && order.amount <= maxPrice
      );
    }

    return filtered;
  }, [data, statusFilter, search, minPrice, maxPrice]);

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
            <option value="Cancelled">Cancelled</option>
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
                <th>Actions</th>
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
                  <tr
                    key={index}
                    className={
                      order.orderStatus === "Cancelled" ? "cancelled-row" : ""
                    }
                  >
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
                    <td className="align-middle">
                      &#x20B9;{order.amount.toFixed(2)}
                    </td>
                    <td className="align-middle">
                      {order.orderedItems.length}
                    </td>

                    <td
                      className={`align-middle fw-bold text-capitalize ${
                        order.orderStatus === "Cancelled"
                          ? "text-danger text-decoration-line-through"
                          : order.orderStatus === "Delivered"
                          ? "text-success"
                          : order.orderStatus === "Out For Delivery"
                          ? "text-primary"
                          : order.orderStatus === "In Kitchen"
                          ? "text-warning"
                          : ""
                      }`}
                    >
                      {order.orderStatus === "Cancelled" ? "❌ " : "● "}
                      {order.orderStatus}
                    </td>

                    <td className="align-middle">
                      {formatOrderDate(order.createdDate)}
                    </td>

                    <td className="align-middle">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={fetchOrders}
                          title="Refresh Orders"
                        >
                          <i className="bi bi-arrow-clockwise"></i>
                        </button>

                        {order.orderStatus !== "Delivered" &&
                          order.orderStatus !== "Cancelled" && (
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
    </div>
  );
};

export default MyOrders;
