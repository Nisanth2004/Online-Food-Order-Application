import React, { useEffect, useState, useMemo } from "react";
import { assets } from "../../assets/assets";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Orders.css";
import { useNavigate } from "react-router-dom";

// ⬅️ Import your custom axios instance
import customAxios from "../../services/CustomAxiosInstance";

const formatDate = (dateStr) => {
  if (!dateStr) return "Not Available";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Not Available";

  const pad = (n) => (n < 10 ? `0${n}` : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const Orders = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dateFilter, setDateFilter] = useState("All");
  const [customDate, setCustomDate] = useState("");

  // 🔵 FETCH ORDERS USING CUSTOM AXIOS
  const fetchOrders = async () => {
    try {
      const response = await customAxios.get("/api/orders/all");
      setData((response.data || []).reverse());
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // 🔵 UPDATE STATUS USING CUSTOM AXIOS
  const updateStatus = async (event, orderId) => {
    const newStatus = event.target.value;

    try {
      await customAxios.patch(
        `/api/orders/status/${orderId}`,
        {},
        {
          params: { status: newStatus },
        }
      );

      setData((prevData) =>
        prevData.map((order) =>
          order.id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error.response || error);
      alert("Failed to update order status.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return (data || [])
      .filter((order) => {
        if (!order) return false;

        if (dateFilter !== "All" && order.createdDate) {
          const orderDate = new Date(order.createdDate).toDateString();
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();

          if (dateFilter === "Today" && orderDate !== today) return false;
          if (dateFilter === "Yesterday" && orderDate !== yesterday) return false;
          if (
            dateFilter === "Custom" &&
            customDate &&
            orderDate !== new Date(customDate).toDateString()
          )
            return false;
        }

        if (statusFilter !== "All" && order.orderStatus !== statusFilter) return false;
        if (minPrice && order.amount < parseFloat(minPrice)) return false;
        if (maxPrice && order.amount > parseFloat(maxPrice)) return false;

        const term = searchTerm.toLowerCase();
        if (term) {
          const items = (order.orderedItems || [])
            .map((i) => i?.name || "")
            .join(",");
          const matchText = `
                ${order.userAddress || ""}
                ${order.phoneNumber || ""}
                ${items}
                ${order.id || ""}
                ${order.email || ""}
                ${order.userName || ""}
            `.toLowerCase();
          return matchText.includes(term);
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  }, [data, statusFilter, searchTerm, minPrice, maxPrice, dateFilter, customDate]);

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

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredOrders.map((o) => ({
        OrderID: o.id,
        Phone: o.phoneNumber,
        Email: o.email,
        Amount: o.amount,
        Status: getDisplayName(o.orderStatus),
        Items: (o.orderedItems || [])
          .map((i) => `${i.name} x${i.quantity}`)
          .join(", "),
        Date: formatDate(o.createdDate),
        Address: o.userAddress,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), `Orders_${new Date().toISOString()}.xlsx`);
  };

  return (
    <div className="container">

      {/* FILTER PANEL */}
      <div className="d-flex flex-wrap align-items-center gap-2 mt-4 mb-4">

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

        <div className="col-md-2">
          <select
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Custom">Choose Date</option>
          </select>
        </div>

        {dateFilter === "Custom" && (
          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          </div>
        )}

        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search name/phone/id"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="col-md-1">
          <input
            type="number"
            className="form-control"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        <div className="col-md-1">
          <input
            type="number"
            className="form-control"
            placeholder="Max ₹"
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
              setDateFilter("All");
              setCustomDate("");
            }}
          >
            Reset Filters
          </button>
        </div>

        <div className="col-md-2">
          <button className="btn btn-success w-100" onClick={exportToExcel}>
            Export Excel
          </button>
        </div>
      </div>

      {/* ORDER TABLE */}
      <div className="card p-3">
        <table className="table">
          <tbody>
            {filteredOrders.length ? (
              filteredOrders.map((order, index) => (
                <tr
                  key={index}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <img src={assets.parcel} height={48} width={48} alt="" />
                  </td>

                  <td>
                    <div>
                      {order.orderedItems?.map((item, idx) =>
                        idx === order.orderedItems.length - 1
                          ? `${item.name} x${item.quantity}`
                          : `${item.name} x${item.quantity}, `
                      )}
                    </div>
                    <div>📍 {order.userAddress}</div>
                    <div>📞 {order.phoneNumber}</div>
                    <div className="text-muted small">
                      Date: {formatDate(order.createdDate)}
                    </div>
                  </td>

                  <td>₹{order.amount.toFixed(2)}</td>
                  <td>Items: {order.orderedItems?.length}</td>

                  <td>
                    <span
                      className={`status-badge status-${order.orderStatus?.toLowerCase()}`}
                    >
                      {getDisplayName(order.orderStatus)}
                    </span>
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
  );
};

export default Orders;
