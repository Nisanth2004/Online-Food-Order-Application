// ⭐ BEAUTIFULLY UPDATED OrderTracking.jsx ⭐
import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../service/CustomAxiosInstance";
import { StoreContext } from "../../Context/StoreContext";
import { toast } from "react-toastify";
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
  return new Date(ts).toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
};

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(StoreContext);

  const [order, setOrder] = useState(null);

  // expandable triggers
  const [showAddressEdit, setShowAddressEdit] = useState(false);
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);

  // address
  const [editingAddress, setEditingAddress] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);

  // phone
  const [editingPhone, setEditingPhone] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneSavedHighlight, setPhoneSavedHighlight] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/api/orders/track/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
      setEditingAddress(res.data.userAddress || "");
      setEditingPhone(res.data.phoneNumber || "");
      setPhoneError("");
    } catch (e) {
      toast.error("Failed to load order");
      console.error(e);
    }
  }, [id, token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  const currentIndex = STATUS_FLOW.indexOf(order?.orderStatus || "");
  const canEdit = currentIndex < STATUS_FLOW.indexOf("SHIPPED");
  const canCancel = currentIndex < STATUS_FLOW.indexOf("SHIPPED");

  // cancel order
  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.patch(`/api/orders/${order.id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order cancelled successfully");
      load();
    } catch (err) {
      toast.error(err?.response?.data || "Failed to cancel");
    }
  };

  // address update
  const handleUpdateAddress = async () => {
    if (editingAddress.trim().length < 5) {
      toast.error("Enter a valid delivery address");
      return;
    }
    setAddressSaving(true);
    try {
      await api.put(
        `/api/orders/update-address/${order.id}`,
        { address: editingAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Address updated!");
      load();
      setShowAddressEdit(false);
    } catch (e) {
      toast.error("Failed to update address");
    } finally {
      setAddressSaving(false);
    }
  };

  // phone validators
  const validatePhone = (phone) => {
    const d = phone.replace(/\D/g, "");
    if (!d) return "Phone required";
    if (d.length !== 10) return "Phone must be 10 digits";
    if (!/^[6-9]\d{9}$/.test(d)) return "Enter valid Indian number";
    return "";
  };

  // update phone
  const handleUpdatePhone = async () => {
    const trim = editingPhone.trim();
    const err = validatePhone(trim);
    if (err) return setPhoneError(err);

    setPhoneSaving(true);
    try {
      await api.put(
        `/api/orders/update-phone/${order.id}`,
        { phone: trim },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPhoneSavedHighlight(true);
      toast.success("Phone number updated!");
      setTimeout(() => setPhoneSavedHighlight(false), 1400);

      load();
      setShowPhoneEdit(false);
    } catch (e) {
      toast.error("Failed to update phone");
    } finally {
      setPhoneSaving(false);
    }
  };

  if (!order) return <div className="loader">Loading...</div>;

  return (
    <div className="tracking-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 className="tracking-title">Order Tracking</h1>
      <p className="tracking-subtitle">Order ID: <strong>{order.id}</strong></p>

      {/* progress bar */}
      <div className="progress-wrapper">
        <div
          className="progress-bar-filled"
          style={{
            width: `${((currentIndex + 1) / STATUS_FLOW.length) * 100}%`,
          }}
        />
      </div>

      <div className="tracking-layout">
        {/* LEFT SIDE */}
        <div className="left-column">
          <h2 className="section-header">Tracking Timeline</h2>

          <div className="vertical-timeline">
            {STATUS_FLOW.map((s, i) => {
              const done = i <= currentIndex;
              const ts = order.statusTimestamps?.[s];

              return (
                <div className="timeline-item" key={s}>
                  <div className={`timeline-dot ${done ? "active" : ""}`} />
                  {i < STATUS_FLOW.length - 1 && (
                    <div
                      className={`timeline-line ${i < currentIndex ? "active" : ""}`}
                    />
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
            <h2 className="section-title">Order Details</h2>

            <p><strong>Status:</strong> {STATUS_LABELS[order.orderStatus]}</p>
            <p>
              <strong>Order Date:</strong>{" "}
              {new Date(order.createdDate).toLocaleString()}
            </p>

            {/* Address Section */}
            <div className="edit-section">
              <div className="edit-header">
                <strong>Delivery Address</strong>
                {canEdit && (
                  <button
                    className="edit-toggle"
                    onClick={() => setShowAddressEdit(!showAddressEdit)}
                  >
                    {showAddressEdit ? "Close" : "Edit"}
                  </button>
                )}
              </div>

              {!showAddressEdit && <p className="static-value">{order.userAddress}</p>}

              {showAddressEdit && (
                <div className="edit-panel">
                  <p className="edit-hint">You can update your address before the order is shipped.</p>
                  <textarea
                    className="edit-textarea"
                    value={editingAddress}
                    onChange={(e) => setEditingAddress(e.target.value)}
                  />
                  <button className="update-btn" onClick={handleUpdateAddress}>
                    {addressSaving ? "Saving…" : "Save Address"}
                  </button>
                </div>
              )}
            </div>

            {/* Courier */}
            {order.courierName && (
              <>
                <p><strong>Courier:</strong> {order.courierName}</p>
                <p><strong>Tracking ID:</strong> {order.courierTrackingId}</p>
                <a
                  href={order.courierTrackUrl + order.courierTrackingId}
                  target="_blank"
                  rel="noreferrer"
                  className="support-btn"
                >
                  Track Shipment
                </a>
              </>
            )}
          </div>

          {canCancel && (
            <button className="cancel-btn" onClick={handleCancelOrder}>
              Cancel Order
            </button>
          )}

          {/* Delivery messages */}
          <div className="delivery-section">
            <h2 className="section-header">Delivery Updates</h2>

            {order.deliveryMessages?.length ? (
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

        {/* RIGHT COLUMN */}
        <div className="right-column">
          {/* Payment */}
          <div className="info-block">
            <h2 className="section-header">Payment Summary</h2>
            <p><strong>Subtotal:</strong> ₹{order.subtotal}</p>
            <p><strong>Tax:</strong> ₹{order.tax}</p>
            <p><strong>Shipping:</strong> ₹{order.shipping}</p>
            <p className="total-amount">Total: ₹{order.grandTotal}</p>
          </div>

          {/* Items */}
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

          {/* Contact Information */}
          <div className="info-block">
            <h2 className="section-header">Contact Information</h2>

            {/* Phone */}
            <div className="edit-section">
              <div className="edit-header">
                <strong>Phone Number</strong>
                {canEdit && (
                  <button
                    className="edit-toggle"
                    onClick={() => setShowPhoneEdit(!showPhoneEdit)}
                  >
                    {showPhoneEdit ? "Close" : "Edit"}
                  </button>
                )}
              </div>

              {!showPhoneEdit && (
                <p className="static-value">{order.phoneNumber || "-"}</p>
              )}

              {showPhoneEdit && (
                <div className="edit-panel">
                  <p className="edit-hint">Update your phone number before the order ships.</p>

                  <input
                    className={`phone-input ${phoneSavedHighlight ? "phone-saved" : ""}`}
                    value={editingPhone}
                    onChange={(e) => {
                      setEditingPhone(e.target.value);
                      setPhoneError("");
                    }}
                    placeholder="Enter 10-digit mobile number"
                  />

                  {phoneError && <p className="form-error">{phoneError}</p>}

                  <button
                    className="update-btn"
                    onClick={handleUpdatePhone}
                    disabled={phoneSaving}
                  >
                    {phoneSaving ? "Saving…" : "Save Phone"}
                  </button>
                </div>
              )}
            </div>

            <div className="info-block-mini">
              <strong>Email:</strong>
              <p>{order.email || "-"}</p>
            </div>

            <div className="info-block-mini">
              <h4>Need Help?</h4>
              <a href="tel:+91XXXXXXXXXX" className="support-btn">Call Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
