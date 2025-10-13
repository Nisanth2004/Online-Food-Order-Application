import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { assets } from "../../assets/assets";

const Orders = () => {
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // ✅ Fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/orders/all");
      setData(response.data.reverse()); // Show latest first
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // ✅ Update order status (instant frontend reflect)
  const updateStatus = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      await axios.patch(
        `http://localhost:8080/api/orders/status/${orderId}`,
        {},
        {
          params: { status: newStatus },
          headers: { "Content-Type": "application/json" },
        }
      );

      // ✅ Instantly update UI without reloading all data
      setData((prevData) =>
        prevData.map((order) =>
          order.id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error.response || error);
      alert("Failed to update order status. Please check backend or CORS.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Filter and search logic
  const filteredOrders = useMemo(() => {
    return data
      .filter((order) => {
        if (statusFilter !== "All" && order.orderStatus !== statusFilter) return false;
        if (minPrice && order.amount < parseFloat(minPrice)) return false;
        if (maxPrice && order.amount > parseFloat(maxPrice)) return false;

        const term = searchTerm.toLowerCase();
        if (term) {
          const matchText = `
            ${order.userAddress || ""}
            ${order.orderedItems.map((i) => i.name).join(",")}
            ${order.id || ""}
            ${order.amount}
          `.toLowerCase();
          return matchText.includes(term);
        }
        return true;
      })
      .sort((a, b) => {
        if (a.createdDate && b.createdDate) {
          return new Date(b.createdDate) - new Date(a.createdDate);
        }
        return 0;
      });
  }, [data, statusFilter, searchTerm, minPrice, maxPrice]);

  // ✅ Convert enum to readable text
  const getDisplayName = (status) => {
    switch (status) {
      case "PREPARING":
        return "In Kitchen";
      case "OUT_FOR_DELIVERY":
        return "Out For Delivery";
      case "DELIVERED":
        return "Delivered";
      default:
        return status;
    }
  };

  // ✅ Convert display name to enum (for sending to backend)
  const mapDisplayToEnum = (displayName) => {
    switch (displayName) {
      case "In Kitchen":
        return "PREPARING";
      case "Out For Delivery":
        return "OUT_FOR_DELIVERY";
      case "Delivered":
        return "DELIVERED";
      default:
        return displayName;
    }
  };

  return (
    <div className="container">
      {/* Filters Section */}
      <div className="row mt-4 mb-3">
        <div className="col-md-2">
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Orders</option>
            <option value="PREPARING">In Kitchen</option>
            <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>

        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, pincode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <button
            className="btn btn-secondary w-100"
            onClick={() => {
              setStatusFilter("All");
              setSearchTerm("");
              setMinPrice("");
              setMaxPrice("");
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="py-4 row justify-content-center">
        <div className="col-11 card">
          <table className="table table-responsive">
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr key={index}>
                    <td>
                      <img src={assets.parcel} height={48} width={48} alt="" />
                    </td>
                    <td>
                      <div>
                        {order.orderedItems.map((item, idx) =>
                          idx === order.orderedItems.length - 1
                            ? `${item.name} x${item.quantity}`
                            : `${item.name} x${item.quantity}, `
                        )}
                      </div>
                      <div>{order.userAddress}</div>
                    </td>
                    <td>&#x20B9;{order.amount.toFixed(2)}</td>
                    <td>Items: {order.orderedItems.length}</td>
                    <td>
                      <select
                        className="form-control"
                        onChange={(event) =>
                          updateStatus(
                            {
                              target: {
                                value: mapDisplayToEnum(event.target.value),
                              },
                            },
                            order.id
                          )
                        }
                        value={getDisplayName(order.orderStatus)}
                      >
                        <option value="In Kitchen">In Kitchen</option>
                        <option value="Out For Delivery">Out For Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
