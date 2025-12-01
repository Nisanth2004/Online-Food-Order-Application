// OrderDetails.jsx (Premium UI, skeleton + timeline + timestamps + subtotal fix)
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // data
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // courier
  const [courierName, setCourierName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [courierList, setCourierList] = useState([]);
  const [saving, setSaving] = useState(false);

  // scanner placeholders (kept for later)
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  /* ---------------- FETCH ---------------- */
  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/orders/admin/${id}`);
      setOrder(res.data || {});
      setCourierName(res.data?.courierName || "");
      setTrackingId(res.data?.courierTrackingId || "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCouriers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/couriers");
      setCourierList(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load courier list");
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchCouriers();
    return () => {
      try { codeReader.current?.reset(); } catch {}
      try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    };
  }, [id]);

  /* ---------------- SAVE COURIER ---------------- */
  const saveCourier = async () => {
    if (!courierName || !trackingId) return toast.error("Select courier & tracking ID");
    setSaving(true);
    try {
      await axios.put(
        `http://localhost:8080/api/orders/admin/courier/${id}`,
        { courierName, courierTrackingId: trackingId }
      );
      toast.success("Courier updated & customer notified");
      await fetchOrder();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update courier");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- DATE HELPERS ---------------- */
  const parseToDate = (x) => {
    if (!x) return null;
    if (x instanceof Date) return x;
    if (typeof x === "number") return new Date(x);
    if (typeof x === "string") {
      // if string doesn't include timezone, assume UTC by appending Z (safe)
      const isoLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?$/;
      const safe = isoLike.test(x) ? x : x.includes(".") ? x.split(".")[0] + "Z" : x + "Z";
      const d = new Date(safe);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
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
// SUBTOTAL = sum of items
const computedSubtotal = useMemo(() => {
  if (!order) return 0;
  return order.orderedItems?.reduce(
    (sum, it) => sum + (it.quantity * it.price),
    0
  ) ?? 0;
}, [order]);



// GRAND TOTAL = backend amount (final)
const computedGrandTotal = Number(order?.amount ?? 0);





 const computedTax = useMemo(() => {
  if (!order) return 0;
  if (order.tax != null) return Number(order.tax);
  const rate = Number(order.taxRate ?? 0.05); // 5%
  return +(computedSubtotal * rate);
}, [order, computedSubtotal]);




  /* ---------------- TIMELINE NORMALIZATION ---------------- */
  // extract ISO-ish timestamp embedded in text
  const extractIsoTimestamp = (text) => {
    if (!text || typeof text !== "string") return null;
    const isoRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?/;
    const m = text.match(isoRegex);
    return m ? m[0] : null;
  };

  const normalizedDeliveryMessages = useMemo(() => {
    const list = Array.isArray(order?.deliveryMessages) ? order.deliveryMessages : [];
    const mapped = list.map((m) => {
      if (typeof m === "string") {
        const ts = extractIsoTimestamp(m);
        const text = ts ? m.replace(ts, "").trim() : m;
        return { text: text || "Update", date: ts || null, raw: m };
      }
      if (typeof m === "object" && m) {
        const rawText = m.text || m.message || m.msg || m.title || "";
        const explicit = m.date || m.timestamp || m.time || m.createdAt || null;
        const embedded = extractIsoTimestamp(rawText);
        const date = explicit || embedded || null;
        const text = embedded ? rawText.replace(embedded, "").trim() : rawText || JSON.stringify(m);
        return { text: text || "Update", date, raw: m };
      }
      return { text: String(m), date: null, raw: m };
    });

    const withDate = mapped
      .map(x => ({ ...x, parsed: parseToDate(x.date) }))
      .filter(x => x.parsed)
      .sort((a,b) => b.parsed - a.parsed);

    const withoutDate = mapped.filter(x => !parseToDate(x.date));

    return [
      ...withDate.map(x => ({ text: x.text, date: x.parsed })),
      ...withoutDate.map(x => ({ text: x.text, date: null }))
    ];
  }, [order]);

  /* ---------------- RENDER ---------------- */
  if (loading) {
    // Skeleton loading UI (clean, consistent)
    return (
      <div className="container py-5 od-wrapper">
        <div className="order-header d-flex justify-content-between align-items-center mb-3">
          <div className="skeleton skel-title skel-inline" style={{ width: 220 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <div className="skeleton skel-line" style={{ width: 120 }} />
            <div className="skeleton skel-line" style={{ width: 80 }} />
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="neo-card">
              <div className="skeleton skel-title" style={{ width: 160 }} />
              <div className="skel-box skeleton" />
              <div className="skeleton skel-table-row" />
              <div className="skeleton skel-table-row" />
              <div className="skeleton skel-table-row" />
            </div>
          </div>

          <div className="col-lg-4">
            <div className="neo-card">
              <div className="skeleton skel-title" style={{ width: 160 }} />
              <div className="skel-box skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 od-wrapper">
        <div className="neo-card p-4">
          <h4>Order not found</h4>
          <p className="text-muted">Unable to locate the order — it may have been removed.</p>
          <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 od-wrapper">
      {/* header */}
      <div className="order-header d-flex justify-content-between align-items-center mb-3">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="back-btn" onClick={fetchOrder}>Refresh</button>
          <div style={{ marginLeft: 12 }}>
            <div className="order-id">#{order.id}</div>
            <div className="text-muted small">Placed: {formatDate(order.createdDate)}</div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div className={`status-badge ${"status-" + (String(order.orderStatus || "unknown").toLowerCase().replace(/\s+/g, "-"))}`}>
            {order.orderStatus || "Unknown"}
          </div>
          <div className="small text-muted" style={{ marginTop: 6 }}>{order.userName || order.customerName}</div>
        </div>
      </div>

      <div className="row g-4">
        {/* left: order summary */}
        <div className="col-lg-8">
          <div className="neo-card p-4">
            <h4 className="section-title">Order Summary</h4>

            <div className="row mb-3">
              <div className="col-md-6">
                <h6>Customer</h6>
                <div className="text-strong">{order.customerName || order.userName}</div>
                <div className="small text-muted">{order.userAddress}</div>
                <div className="small text-muted" style={{ marginTop: 6 }}>📞 {order.phoneNumber}</div>
              </div>
              <br/>
              <br/>

              <br/>
              <br/>

            <div className="payment-status-box">
  <h6 className="section-title">Payment Status</h6>

  <div className={`payment-status-tag ${order.paymentStatus?.toLowerCase()}`}>
    {order.paymentStatus || "—"}
  </div>

  <div className="payment-amount">
    Amount: ₹{computedGrandTotal.toFixed(2)}
  </div>
</div>

            </div>

            <hr />

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
                  {Array.isArray(order.orderedItems) && order.orderedItems.length ? (
                    order.orderedItems.map((it, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{it.name}</td>
                        <td className="text-center">{it.quantity}</td>
<td className="text-end">
  ₹{(it.quantity * it.price).toFixed(2)}
</td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-muted small">No items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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

          {/* courier card */}
          <div className="neo-card p-3 mt-4">
            <h6>Courier Information</h6>
            <div className="row gy-2 align-items-end">
              <div className="col-md-4">
                <label className="form-label small">Courier</label>
                <select className="form-select form-select-sm" value={courierName} onChange={(e) => setCourierName(e.target.value)}>
                  <option value="">Select courier</option>
                  {courierList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="col-md-5">
                <label className="form-label small">Tracking ID</label>
                <div className="input-group input-group-sm">
                  <input className="form-control" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} />
                  <button className="btn btn-outline-secondary" type="button" onClick={() => setScannerOpen(true)}>📷</button>
                </div>
              </div>

              <div className="col-md-3 d-grid">
                <button className="btn btn-primary btn-sm" disabled={saving} onClick={saveCourier}>{saving ? "Saving…" : "Save & Notify"}</button>
                <button className="btn btn-outline-secondary btn-sm mt-2" onClick={() => { setCourierName(""); setTrackingId(""); }}>Reset</button>
              </div>
            </div>
          </div>
        </div>

        {/* right: timeline */}
        <div className="col-lg-4">
          <div className="neo-card p-3 h-100">
            <h6 className="section-title">Delivery Timeline</h6>
            <div className="timeline-wrapper" aria-live="polite">
              {normalizedDeliveryMessages.length ? (
                <div className="timeline-list">
                  {normalizedDeliveryMessages.map((m, i) => {
                    const date = m.date ? parseToDate(m.date) : null;
                    const clean = (m.text || "").replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?/gi, "").trim();
                    const low = (clean || "").toLowerCase();

                    let icon = "📦";
                    let colorClass = "tl-default";
                    if (low.includes("placed")) colorClass = "tl-placed";
                    else if (low.includes("packed")) colorClass = "tl-packed";
                    else if (low.includes("shipped")) { icon = "🚚"; colorClass = "tl-shipped"; }
                    else if (low.includes("out for")) { icon = "🚚"; colorClass = "tl-out"; }
                    else if (low.includes("delivered")) { icon = "✔️"; colorClass = "tl-delivered"; }
                    else if (low.includes("failed") || low.includes("fail")) { icon = "❌"; colorClass = "tl-failed"; }

                    // stagger animation
                    const delayMs = i * 80;

                    return (
                      <div key={i} className={`timeline-row ${i === 0 ? "newest" : ""}`} style={{ animationDelay: `${delayMs}ms` }}>
                        <div className="timeline-marker">
                          <span className={`dot ${colorClass}`}></span>
                          {i !== normalizedDeliveryMessages.length - 1 && <span className="connector" />}
                        </div>

                        <div className="timeline-body">
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="timeline-icon" aria-hidden>{icon}</div>
                            <div style={{ flex: 1 }}>
                              <div className="timeline-text">{clean || "Update"}</div>
                              <div className="timeline-time">
                                {date ? (
                                  <>
                                    <div>{formatDate(date)}</div>
                                    <div className="text-muted small">{timeAgo(date)}</div>
                                  </>
                                ) : (
                                  <div className="text-muted small">—</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted small">No updates yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* scanner modal skeleton (placeholder) */}
      {scannerOpen && (
        <div className="neo-scanner-overlay" role="dialog" aria-modal="true">
          <div className="neo-scanner-card">
            <div className="d-flex justify-content-between mb-2">
              <h6>Scan Barcode</h6>
              <button className="btn btn-light btn-sm" onClick={() => setScannerOpen(false)}>Close</button>
            </div>
            <div className="neo-scanner-video">
              <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} playsInline muted />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
