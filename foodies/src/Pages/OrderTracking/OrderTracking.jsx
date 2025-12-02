import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../service/CustomAxiosInstance";
import { StoreContext } from "../../Context/StoreContext";
import "./OrderTracking.css";

const STATUS_FLOW = [
  "ORDER_PLACED",
  "ORDER_CONFIRMED",
  "ORDER_PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const STATUS_LABELS = {
  ORDER_PLACED: "Order Placed",
  ORDER_CONFIRMED: "Order Confirmed",
  ORDER_PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const formatTime = (ts) => {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  } catch {
    return ts;
  }
};

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(StoreContext);
  const [order, setOrder] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/orders/track/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [id, token]);

  // ✅ AUTO REFRESH EVERY 20 SECONDS
  useEffect(() => {
    load(); // initial fetch
    const interval = setInterval(load, 20000); // 20 sec refresh
    return () => clearInterval(interval); // cleanup
  }, [load]);

  if (!order) return <div className="loader">Loading...</div>;

  const currentIndex = STATUS_FLOW.indexOf(order.orderStatus);
  const progressPercent = ((currentIndex + 1) / STATUS_FLOW.length) * 100;

  return (
    <div className="tracking-page">

      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 className="tracking-title">Order Tracking</h1>
      <p className="tracking-subtitle">
        Order ID: <strong>{order.id}</strong>
      </p>

      {/* Progress Bar */}
      <div className="progress-wrapper">
        <div
          className="progress-bar-filled"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="tracking-layout">

        {/* LEFT SIDE – Timeline */}
        <div className="left-column">
          <h2 className="section-header">Tracking Timeline</h2>

          <div className="vertical-timeline">
            {STATUS_FLOW.map((s, i) => {
              const done = i <= currentIndex;
              const ts = order.statusTimestamps?.[s];

              return (
                <div className="timeline-item" key={s}>
                  <div className={`timeline-dot ${done ? "active" : ""}`}></div>

                  {i < STATUS_FLOW.length - 1 && (
                    <div
                      className={`timeline-line ${
                        i < currentIndex ? "active" : ""
                      }`}
                    ></div>
                  )}

                  <div className="timeline-info">
                    <p className={`timeline-title ${done ? "active" : ""}`}>
                      {STATUS_LABELS[s]}
                    </p>
                    <p className="timeline-time">{formatTime(ts)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ORDER DETAILS */}
          <div className="info-block">
            <h2 className="section-header">Order Details</h2>
            <p><strong>Status:</strong> {STATUS_LABELS[order.orderStatus]}</p>
            <p><strong>Order Date:</strong> {new Date(order.createdDate).toLocaleString()}</p>

            {order.courierName && (
              <>
                <p><strong>Courier:</strong> {order.courierName}</p>
                <p><strong>Tracking ID:</strong> {order.courierTrackingId}</p>

                {order.courierTrackUrl && (
                  <a
                    href={order.courierTrackUrl + order.courierTrackingId}
                    target="_blank"
                    rel="noreferrer"
                    className="support-btn"
                  >
                    Track Shipment
                  </a>
                )}
              </>
            )}
          </div>

          {/* DELIVERY UPDATES – FULL PAGE */}
          <div className="delivery-section">
            <h2 className="section-header">Delivery Updates</h2>

            {order.deliveryMessages?.length > 0 ? (
              order.deliveryMessages.map((msg, i) => (
                <div className="delivery-update" key={i}>
                  <div className="delivery-line" />
                  <div className="delivery-dot" />
                  <div className="delivery-content">
                    <p className="delivery-text">{msg.message}</p>
                    <p className="delivery-time">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-msg">No updates yet.</p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE – Payment + Items + Support */}
        <div className="right-column">

          <div className="info-block">
            <h2 className="section-header">Payment Summary</h2>
            <p><strong>Subtotal:</strong> ₹{order.subtotal}</p>
            <p><strong>Tax:</strong> ₹{order.tax}</p>
            <p><strong>Shipping:</strong> ₹{order.shipping}</p>
            <p className="total-amount">Total: ₹{order.grandTotal}</p>
          </div>

          <div className="info-block">
            <h2 className="section-header">Items</h2>
            {order.orderedItems.map((item, i) => (
              <div className="item-row" key={i}>
                <div>
                  <p className="item-name">{item.name}</p>
                  <p className="item-qty">Qty: {item.quantity}</p>
                </div>
                <p className="item-price">₹{item.quantity * item.price}</p>
              </div>
            ))}
          </div>

          <div className="info-block">
            <h4>Need Help?</h4>
            <a href="tel:+91XXXXXXXXXX" className="support-btn">
              Call Support
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
