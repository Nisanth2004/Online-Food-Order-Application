// OrderDetails.jsx (Premium UI - Clean & Fully Sized)
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "./OrderDetails.css";
import api from "../services/CustomAxiosInstance";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Courier
  const [courierName, setCourierName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [courierList, setCourierList] = useState([]);
  const [saving, setSaving] = useState(false);

  // Scanner
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  /* ---------------- FETCH ORDER ---------------- */
  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/orders/admin/${id}`);
      setOrder(res.data || {});
      setCourierName(res.data?.courierName || "");
      setTrackingId(res.data?.courierTrackingId || "");
    } catch {
      toast.error("Failed to load order");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCouriers = async () => {
    try {
      const res = await api.get("/api/admin/couriers");
      setCourierList(res.data || []);
    } catch {
      toast.error("Could not load courier list");
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchCouriers();
    return () => {
      try {
        codeReader.current?.reset();
        streamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {}
    };
  }, [id]);

  /* ---------------- SAVE COURIER ---------------- */
  const saveCourier = async () => {
    if (!courierName || !trackingId)
      return toast.error("Enter courier & tracking ID");

    setSaving(true);

    try {
      await api.put(`/api/orders/admin/courier/${id}`, {
        courierName,
        courierTrackingId: trackingId,
      });
      toast.success("Courier updated & customer notified");
      fetchOrder();
    } catch {
      toast.error("Failed to update courier");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- DATE HELPERS ---------------- */
  const parseToDate = (x) => {
    if (!x) return null;
    const d = new Date(x);
    return isNaN(d) ? null : d;
  };

  const formatDate = (d) => {
    const dt = parseToDate(d);
    if (!dt) return "N/A";
    return dt.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timeAgo = (d) => {
    const dt = parseToDate(d);
    if (!dt) return "";
    const diff = Math.floor((Date.now() - dt.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  /* ---------------- TOTALS ---------------- */
  const computedSubtotal = useMemo(() => {
    return (
      order?.orderedItems?.reduce(
        (sum, it) => sum + it.quantity * it.price,
        0
      ) ?? 0
    );
  }, [order]);

  const computedGrandTotal = Number(order?.amount ?? 0);

  const computedTax = useMemo(() => {
    if (!order) return 0;
    if (order.tax != null) return Number(order.tax);
    const rate = Number(order.taxRate ?? 0.05);
    return +(computedSubtotal * rate);
  }, [order, computedSubtotal]);

  /* ---------------- TIMELINE CLEAN ---------------- */
  const extractIsoTimestamp = (text) => {
    if (!text) return null;
    const regex =
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?/;
    const m = text.match(regex);
    return m ? m[0] : null;
  };

  const normalizedDeliveryMessages = useMemo(() => {
    const list = Array.isArray(order?.deliveryMessages)
      ? order.deliveryMessages
      : [];

    const mapped = list.map((m) => {
      if (typeof m === "string") {
        const ts = extractIsoTimestamp(m);
        return {
          text: m.replace(ts, "").trim(),
          date: ts ? parseToDate(ts) : null,
        };
      }
      return {
        text: m.text || m.message || "Update",
        date: parseToDate(m.date || m.timestamp),
      };
    });

    return mapped
      .filter((x) => x)
      .sort((a, b) => (b.date ? b.date - a.date : 0));
  }, [order]);

  /* ---------------- RENDER ---------------- */
  if (loading) {
    return (
      <div className="container py-5 od-wrapper">
        <div className="neo-card p-4 text-center">Loading order…</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 od-wrapper">
        <div className="neo-card p-4 text-center">
          <h4>Order not found</h4>
          <button className="back-btn mt-3" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 od-wrapper">

      {/* Header */}
      <div className="order-header d-flex justify-content-between align-items-center mb-3">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <button className="back-btn" onClick={fetchOrder}>
            Refresh
          </button>
          <div style={{ marginLeft: 12 }}>
            <div className="order-id">#{order.id}</div>
            <div className="text-muted small">
              Placed: {formatDate(order.createdDate)}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            className={`status-badge status-${String(
              order.orderStatus
            ).toLowerCase()}`}
          >
            {order.orderStatus}
          </div>
          <div className="small text-muted mt-1">
            {order.userName || order.customerName}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column */}
        <div className="col-lg-8">
          {/* Order Summary */}
          <div className="neo-card p-4">
            <h4 className="section-title">Order Summary</h4>

            {/* Customer + Payment */}
            <div className="row mb-3">
              <div className="col-md-6">
                <h6>Customer</h6>
                <div className="text-strong">
                  {order.customerName || order.userName}
                </div>
                <div className="text-muted small">{order.userAddress}</div>
                <div className="text-muted small mt-1">
                  📞 {order.phoneNumber}
                </div>
              </div>

              <div className="col-md-6">
                <div className="payment-status-box">
                  <h6 className="section-title">Payment Status</h6>
                  <div
                    className={`payment-status-tag ${order.paymentStatus?.toLowerCase()}`}
                  >
                    {order.paymentStatus}
                  </div>
                  <div className="payment-amount mt-1">
                    Amount: ₹{computedGrandTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <hr />

            {/* Items */}
            <h6>Items</h6>
            <div className="table-responsive neo-table-wrap mb-3">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderedItems?.map((it, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{it.name}</td>
                      <td className="text-center">{it.quantity}</td>
                      <td className="text-end">
                        ₹{(it.quantity * it.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="d-flex justify-content-end">
              <div className="neo-total p-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Subtotal</span>
                  <span>₹{computedSubtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Tax</span>
                  <span>₹{computedTax.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Grand Total</span>
                  <span>₹{computedGrandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Courier */}
          <div className="neo-card p-3 mt-4">
            <h6>Courier Information</h6>

            <div className="row gy-2 align-items-end">
              <div className="col-md-4">
                <label className="form-label small">Courier</label>
                <select
                  className="form-select form-select-sm"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                >
                  <option value="">Select courier</option>
                  {courierList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-5">
                <label className="form-label small">Tracking ID</label>
                <div className="input-group input-group-sm">
                  <input
                    className="form-control"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setScannerOpen(true)}
                  >
                    📷
                  </button>
                </div>
              </div>

              <div className="col-md-3 d-grid">
                <button
                  className="btn btn-primary btn-sm"
                  disabled={saving}
                  onClick={saveCourier}
                >
                  {saving ? "Saving…" : "Save & Notify"}
                </button>

                <button
                  className="btn btn-outline-secondary btn-sm mt-2"
                  onClick={() => {
                    setCourierName("");
                    setTrackingId("");
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Timeline */}
        <div className="col-lg-4">
          <div className="neo-card p-3 h-100">
            <h6 className="section-title">Delivery Timeline</h6>

            <div className="timeline-wrapper">
              {normalizedDeliveryMessages.length ? (
                normalizedDeliveryMessages.map((m, i) => {
                  const low = (m.text || "").toLowerCase();
                  let icon = "📦";
                  let colorClass = "tl-default";

                  if (low.includes("placed")) colorClass = "tl-placed";
                  else if (low.includes("packed")) colorClass = "tl-packed";
                  else if (low.includes("shipped")) {
                    icon = "🚚";
                    colorClass = "tl-shipped";
                  } else if (low.includes("out")) {
                    icon = "🚚";
                    colorClass = "tl-out";
                  } else if (low.includes("delivered")) {
                    icon = "✔️";
                    colorClass = "tl-delivered";
                  }

                  return (
                    <div
                      key={i}
                      className="timeline-row"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="timeline-marker">
                        <span className={`dot ${colorClass}`}></span>
                        {i !== normalizedDeliveryMessages.length - 1 && (
                          <span className="connector" />
                        )}
                      </div>

                      <div className="timeline-body">
                        <div className="timeline-icon">{icon}</div>
                        <div>
                          <div className="timeline-text">{m.text}</div>
                          <div className="timeline-time">
                            {m.date ? (
                              <>
                                <div>{formatDate(m.date)}</div>
                                <div className="small text-muted">
                                  {timeAgo(m.date)}
                                </div>
                              </>
                            ) : (
                              <div className="text-muted small"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-muted small">No updates yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {scannerOpen && (
        <div className="neo-scanner-overlay">
          <div className="neo-scanner-card">
            <div className="d-flex justify-content-between mb-2">
              <h6>Scan Barcode</h6>
              <button
                className="btn btn-light btn-sm"
                onClick={() => setScannerOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="neo-scanner-video">
              <video
                ref={videoRef}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                playsInline
                muted
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
