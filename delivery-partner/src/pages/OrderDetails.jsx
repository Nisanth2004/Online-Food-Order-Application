import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { PartnerContext } from "../context/PartnerContext";
import toast from "react-hot-toast";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "./OrderDetails.css";

const STATUS_FLOW = [
  "ORDER_PLACED",
  "ORDER_CONFIRMED",
  "ORDER_PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

const STATUS_LABELS = {
  ORDER_PLACED: "Placed",
  ORDER_CONFIRMED: "Confirmed",
  ORDER_PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",

};

// <<-- IMPORTANT: include all statuses here (front-end actions) -->
const ACTIONS = [
  ...STATUS_FLOW,
  
  "CANCELLED"
];

export default function OrderDetails() {
  const { id } = useParams();
  const { partnerName } = useContext(PartnerContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/orders/admin/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (status) => {
    if (!order) return;
    if (order.orderStatus === status) return; // already
    setIsUpdating(true);
    try {
      await api.patch(`/api/orders/status/${id}`, null, { params: { status } });
      toast.success("Status updated to " + (STATUS_LABELS[status] || status));
      // optimistic update
      setOrder((p) => ({ ...p, orderStatus: status }));
      // optionally reload canonical state:
      // await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return toast.error("Enter a message");
    setSendingMessage(true);
    const msgObj = { text: messageText.trim(), createdAt: new Date().toISOString() };
    try {
      await api.post(`/api/orders/partner/${id}/message`, { message: messageText });
      toast.success("Message sent");
      await load();
    } catch (err) {
      toast("Saved locally", { icon: "⚠️" });
      setOrder((prev) => ({
        ...prev,
        deliveryMessages: [...(prev.deliveryMessages || []), msgObj]
      }));
    } finally {
      setMessageText("");
      setSendingMessage(false);
    }
  };

  const startScanner = async () => {
    setShowScanner(true);
    codeReader.current = new BrowserMultiFormatReader();
    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const preferred = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[0];
      const deviceId = preferred?.deviceId;
      codeReader.current.decodeFromVideoDevice(deviceId || null, videoRef.current, (result) => {
        if (result) {
          const text = result?.text || String(result);
          setOrder((p) => ({ ...p, courierTrackingId: text }));
          toast.success("Scanned: " + text);
          stopScanner();
        }
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId ? { exact: deviceId } : undefined, facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      console.error(e);
      toast.error("Camera not available");
      stopScanner();
    }
  };

  const stopScanner = () => {
    setShowScanner(false);
    try { codeReader.current?.reset(); } catch {}
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    codeReader.current = null;
  };

  const saveTrackingToServer = async () => {
    if (!order?.courierName || !order?.courierTrackingId) return toast.error("Set courier & tracking ID");
    try {
      await api.put(`/api/orders/admin/courier/${id}`, {
        courierName: order.courierName,
        courierTrackingId: order.courierTrackingId
      });
      toast.success("Tracking saved");
      load();
    } catch (err) {
      console.error(err);
      toast.error("Server refused. Saved locally");
      setOrder((p) => ({ ...p, courierName: order.courierName, courierTrackingId: order.courierTrackingId }));
    }
  };

  if (loading) return <div className="container page">Loading...</div>;
  if (!order) return <div className="container page">Order not found</div>;

  // defensive current index (if backend returns unknown status indexOf -> -1)
  const currentStepIndex = STATUS_FLOW.indexOf(order.orderStatus);
  const currentIndex = currentStepIndex >= 0 ? currentStepIndex : -1;

  // normalize messages (ensure text + createdAt)
  const messages = (order.deliveryMessages || []).map(m => {
    if (!m) return null;
    if (typeof m === "string") return { text: m, createdAt: new Date().toISOString() };
    if (m.text) return { text: m.text, createdAt: m.createdAt || new Date().toISOString() };
    // server might use { message: '...' }
    return { text: m.message || JSON.stringify(m), createdAt: m.createdAt || new Date().toISOString() };
  }).filter(Boolean).reverse();

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  return (
    <div className="container page">
      <button className="btn ghost mb-3" onClick={() => navigate(-1)}>⬅ Back</button>

      <div className="card order-card grid">
        <div className="order-header">
          <h2>Order #{order.id}</h2>
          <div className="status-area">
            <span className={`badge big ${order.orderStatus === 'CANCELLED' ? 'danger' : ''}`}>
              {STATUS_LABELS[order.orderStatus] || order.orderStatus}
            </span>
            <div className="small-meta">Placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</div>
          </div>
        </div>

        <div className="order-grid">
          <div className="left">
            <div className="order-info">
              <div><strong>Customer:</strong> {order.userAddress}</div>
              <div><strong>Phone:</strong> {order.phoneNumber}</div>
              <div><strong>Amount:</strong> ₹{(order.amount || 0).toFixed(2)}</div>
            </div>

            <hr />

            <h4>Items</h4>
            <ul className="items-list">
              {(order.orderedItems || []).map((it, idx) => (
                <li key={idx} className="item-row">{it.name} <span className="muted">x{it.quantity}</span></li>
              ))}
            </ul>

            <hr />

            <h4>Delivery / Tracking</h4>
            <div className="form-row tracking-row">
              <input
                placeholder="Courier name"
                value={order.courierName || partnerName || ""}
                onChange={(e) => setOrder({...order, courierName: e.target.value})}
              />
              <input
                placeholder="Tracking ID"
                value={order.courierTrackingId || ""}
                onChange={(e) => setOrder({...order, courierTrackingId: e.target.value})}
              />
            </div>
            <div className="tracking-actions">
              <button className="btn" onClick={startScanner}>Scan</button>
              <button className="btn primary" onClick={saveTrackingToServer}>Save</button>
            </div>

            <hr />

            {/* ---------- Actions (use all statuses, prevent reverting) ---------- */}
            <h4>Actions</h4>
            <div className="actions flow-actions" style={{ gap: 10, flexWrap: "wrap" }}>
              {ACTIONS.map((s) => {
                const isCurrent = order.orderStatus === s;
                const inFlowIndex = STATUS_FLOW.indexOf(s); // -1 for CANCEL_*
                // canSet true only if s is a later step in main flow
                const canSetMainFlow = inFlowIndex >= 0 && inFlowIndex > currentIndex;
                const isCancelable = (s === "CANCELLED" || s === "CANCEL_REQUESTED") &&
                  order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED";

                const canSet = canSetMainFlow || isCancelable;

                const cls = (() => {
                  if (s === "CANCELLED") return "btn danger";
                 
                  if (isCurrent) return "btn ghost";
                  return canSet ? "btn primary" : "btn ghost";
                })();

                return (
                  <button
                    key={s}
                    className={cls}
                    onClick={() => canSet && updateStatus(s)}
                    disabled={!canSet || isUpdating || isCurrent}
                    title={isCurrent ? "Current status" : (!canSet ? "Cannot set this status" : `Set status: ${STATUS_LABELS[s] || s}`)}
                    style={{ minWidth: 140 }}
                  >
                    {STATUS_LABELS[s] || s}
                  </button>
                );
              })}
            </div>

            <hr />

            <h4>Send Message</h4>
            <textarea
              rows="3"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message to customer..."
            />
            <div className="message-actions">
              <button className="btn" onClick={sendMessage} disabled={sendingMessage}>Send</button>
              <button className="btn ghost" onClick={() => setMessageText("Your order has been shipped")}>Quick: shipped</button>
              <button className="btn ghost" onClick={() => setMessageText("Your item has arrived at our office")}>Quick: arrived</button>
            </div>

          </div>

          <aside className="right">
            <div className="messages-card">
              <div className="messages-header">
                <h4>Delivery Messages</h4>
                <div className="muted small">{messages.length} message{messages.length !== 1 ? 's' : ''}</div>
              </div>

              <ul className="messages-list">
                {messages.length === 0 && <li className="empty">No messages yet</li>}
                {messages.map((m, i) => (
                  <li className="msg" key={i}>
                    <div className="avatar">DP</div>
                    <div className="msg-body">
                      <div className="msg-text">{m.text}</div>
                      <div className="msg-meta muted">{formatDate(m.createdAt)}</div>
                    </div>
                  </li>
                ))}
              </ul>

            </div>
          </aside>
        </div>

      </div>

      {showScanner && (
        <div className="scanner-modal">
          <div className="scanner-content">
            <h4>Scan barcode</h4>
            <video ref={videoRef} style={{ width: "100%" }} playsInline muted></video>
            <button className="btn mt-2" onClick={stopScanner}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
