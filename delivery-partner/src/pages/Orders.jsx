import React, { useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { PartnerContext } from "../context/PartnerContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Orders() {
  const { partnerName } = useContext(PartnerContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/orders/all");
      const all = res.data || [];
      // Filter orders assigned to this courier name
      const filtered = partnerName
        ? all.filter((o) => o.courierName && o.courierName === partnerName)
        : [];
      setOrders(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // poll every 20 seconds for updates
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [partnerName]);

  return (
    <div className="container page">
      <h2>Assigned Orders</h2>
      {!partnerName && (
        <div className="notice">
          <strong>Note:</strong> No courier name set. Go to <a href="/settings">Settings</a> and set your assigned courier name.
        </div>
      )}

      <div className="orders-grid">
        {loading ? <div>Loading...</div> : null}
        {!loading && orders.length === 0 && (
          <div className="empty">No orders assigned to {partnerName || "you"}.</div>
        )}
        {orders.map((order) => (
          <div key={order.id} className="order-card" onClick={() => navigate(`/order/${order.id}`)}>
            <div className="row-between">
              <div>
                <div className="muted small">Order #{order.id}</div>
                <div className="bold">{order.orderedItems?.map(it => `${it.name} x${it.quantity}`).join(", ")}</div>
              </div>
              <div className="muted small">₹{order.amount.toFixed(2)}</div>
            </div>

            <div className="muted small">📞 {order.phoneNumber}</div>
            <div className="muted small">📍 {order.userAddress}</div>
            <div className="mt-8">
              <div className={`status ${order.orderStatus?.toLowerCase() || ""}`}>{order.orderStatus}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
