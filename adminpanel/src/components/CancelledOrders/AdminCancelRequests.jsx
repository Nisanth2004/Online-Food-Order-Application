import React, { useEffect, useState } from "react";
// ✅ use global axios instance
import { toast } from "react-toastify";
import api from "../../services/CustomAxiosInstance";

const AdminCancelRequests = () => {
  const [requests, setRequests] = useState([]);

  // ✅ Fetch all orders
  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/orders/all");

      // filter orders with CANCEL_REQUESTED
      const cancelRequests = res.data.filter(
        (order) => order.orderStatus === "CANCEL_REQUESTED"
      );
      setRequests(cancelRequests);
    } catch (err) {
      toast.error("Failed to load cancel requests");
    }
  };

  // ✅ Handle approve/reject actions
  const handleDecision = async (orderId, action) => {
    try {
      if (action === "approve") {
        await api.patch(`/api/orders/approve-cancel/${orderId}`);
        toast.success("Order cancelled successfully");
      } else if (action === "reject") {
        await api.patch(`/api/orders/status/${orderId}?status=PREPARING`);
        toast.success("Cancel request rejected, order kept");
      }

      fetchRequests(); // refresh table
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="container py-5">
      <h3>Cancel Requests</h3>
      <div className="row justify-content-center">
        <div className="col-11 card p-3 shadow-sm">
          <table className="table table-hover table-responsive">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No cancel requests
                  </td>
                </tr>
              ) : (
                requests.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.email || order.userId}</td>
                    <td>
                      {order.orderedItems
                        .map((i) => `${i.name} x${i.quantity}`)
                        .join(", ")}
                    </td>
                    <td>&#x20B9;{order.amount.toFixed(2)}</td>
                    <td className="text-warning">{order.orderStatus}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger me-2"
                        onClick={() => handleDecision(order.id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleDecision(order.id, "reject")}
                      >
                        Reject
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

export default AdminCancelRequests;
