// src/pages/OrderDetails.jsx
// Professional Delivery Partner UI — Full Admin/Partner + User version (corrected)
import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { PartnerContext } from "../context/PartnerContext";
import toast from "react-hot-toast";
import { BrowserMultiFormatReader } from "@zxing/browser";
import PODModal from "../components/PODModal";
import AttemptModal from "../components/AttemptModal";

/**
 * OrderDetails — full partner/admin + user view
 *
 * - If partnerName is present in PartnerContext -> treat as partner/staff UI (editable)
 * - Otherwise treat as readonly user tracking page
 *
 * Notes:
 * - Backend should enforce role-based authorization.
 * - We append `actor=partner` query param on status update calls so server can log/validate.
 */

const STATUS_FLOW = [
  "ORDER_PLACED",
  "ORDER_CONFIRMED",
  "ORDER_PACKED",
  "SHIPPED",
  "ORDER_AT_HUB"
];

const STATUS_LABELS = {
  ORDER_PLACED: "Placed",
  ORDER_CONFIRMED: "Confirmed",
  ORDER_PACKED: "Packed",
  SHIPPED: "Shipped",
  ORDERA_AT_HUB:"At Hub",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ACTIONS = [...STATUS_FLOW, "CANCELLED"];

export default function OrderDetails() {
  const { id } = useParams();
  const { partnerName } = useContext(PartnerContext);
  const isPartner = Boolean(partnerName); // role check (frontend-side)
  const navigate = useNavigate();

  // Order state
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [podOpen, setPodOpen] = useState(false);
  const [attemptOpen, setAttemptOpen] = useState(false);

  // scanner
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  // Load order
  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/orders/admin/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error("load order failed", err);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // cleanup scanner if user navigates away
    return () => {
      try {
        codeReader.current?.reset?.();
      } catch {}
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [id]);

  // Helpers
  const formatStatus = (s) => (s ? s.replace(/_/g, " ") : "");
  const formatDateTime = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso || "";
    }
  };

  const currentIndex = STATUS_FLOW.indexOf(order?.orderStatus);

  // ========== STATUS UPDATE ==========
  // Rules enforced client-side:
  // - Partners can advance status forward (ORDER_PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED)
  // - Partners can mark CANCELLED (if needed) but backend should validate
  // - Regular users cannot change status from frontend
  const canUpdateTo = (nextStatus) => {
    if (!isPartner) return false; // only partners can change
    if (!order) return false;
    if (order.orderStatus === nextStatus) return false;
    // allow CANCELLED always (subject to backend)
    if (nextStatus === "CANCELLED") return true;
    // allow forward movement in flow
    const current = STATUS_FLOW.indexOf(order.orderStatus);
    const target = STATUS_FLOW.indexOf(nextStatus);
    return target > current;
  };

  // Confirm then call backend
  const updateStatus = async (nextStatus) => {
    if (!canUpdateTo(nextStatus)) return;
    // small confirmation for destructive steps
    const ok = window.confirm(`Change status to "${STATUS_LABELS[nextStatus] || nextStatus}"?`);
    if (!ok) return;

    setIsUpdating(true);

    // optimistic update snapshot
    const before = order;
    setOrder((o) => ({ ...o, orderStatus: nextStatus }));

    try {
      // include actor param so server can identify partner
      await api.patch(`/api/orders/status/${id}`, null, { params: { status: nextStatus, actor: isPartner ? "partner" : "user", partnerName: partnerName || "" } });

      toast.success(`Status updated to ${STATUS_LABELS[nextStatus] || nextStatus}`);
      // Append a delivery message that partner changed status (so timeline shows actor)
      const msg = {
        text: `${isPartner ? `${partnerName} (partner)` : "User"} set status to ${STATUS_LABELS[nextStatus] || nextStatus}`,
        createdAt: new Date().toISOString(),
      };
      setOrder((o) => ({ ...o, deliveryMessages: [...(o.deliveryMessages || []), msg] }));
      // Reload to get server's canonical order (timestamps, etc.)
      await load();
    } catch (err) {
      console.error("update status failed", err);
      toast.error("Failed to update status");
      setOrder(before); // rollback optimistic
    } finally {
      setIsUpdating(false);
    }
  };

  // ========== MESSAGING ==========
  const sendMessage = async () => {
    if (!messageText.trim()) return toast.error("Enter a message");
    setSendingMessage(true);

    try {
      await api.post(`/api/orders/partner/${id}/message`, { message: messageText });
      toast.success("Message sent");
      setMessageText("");
      await load();
    } catch (err) {
      // fallback: append locally
      toast.error("Failed to send message — saved locally");
      const localMsg = { text: `${partnerName ? partnerName + ": " : ""}${messageText}`, createdAt: new Date().toISOString() };
      setOrder((o) => ({ ...o, deliveryMessages: [...(o.deliveryMessages || []), localMsg] }));
      setMessageText("");
    } finally {
      setSendingMessage(false);
    }
  };

  // ========== SCANNER ==========
  const startScanner = async () => {
    setShowScanner(true);
    codeReader.current = new BrowserMultiFormatReader();
    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const preferred = devices.find((d) => /back|rear|environment/i.test(d.label)) || devices[0];
      const deviceId = preferred?.deviceId;
      codeReader.current.decodeFromVideoDevice(deviceId || null, videoRef.current, (result) => {
        if (result) {
          toast.success("Scanned: " + result.text);
          // set tracking id locally
          setOrder((o) => ({ ...o, courierTrackingId: result.text }));
          stopScanner();
        }
      });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: deviceId ? { exact: deviceId } : undefined, facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("camera", err);
      toast.error("Camera not accessible");
      stopScanner();
    }
  };

  const stopScanner = () => {
    setShowScanner(false);
    try { codeReader.current?.reset?.(); } catch {}
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  // ========== SAVE TRACKING ==========
  const saveTrackingToServer = async () => {
    if (!isPartner) return toast.error("Only partner can save tracking");
    if (!order?.courierName || !order?.courierTrackingId) return toast.error("Set courier name & tracking ID");

    try {
      await api.put(`/api/orders/admin/courier/${id}`, { courierName: order.courierName, courierTrackingId: order.courierTrackingId });
      toast.success("Courier & tracking saved");
      // append local message
      const msg = { text: `${partnerName}: set courier ${order.courierName} / ${order.courierTrackingId}`, createdAt: new Date().toISOString() };
      setOrder((o) => ({ ...o, deliveryMessages: [...(o.deliveryMessages || []), msg] }));
      await load();
    } catch (err) {
      console.error("save tracking", err);
      toast.error("Failed to save tracking");
    }
  };

  // ========== CALL + NAVIGATE ==========
  const callCustomer = () => {
    if (!order?.phoneNumber) return toast.error("No phone number");
    window.open(`tel:${order.phoneNumber}`);
  };

  const navigateToCustomer = () => {
    const lat = order?.deliveryLat || order?.lat;
    const lng = order?.deliveryLng || order?.lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, "_blank");
      return;
    }
    const encoded = encodeURIComponent(order?.userAddress || "");
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank");
  };

  // ========= UI Helpers ==========
  const isFinal = order?.orderStatus === "DELIVERED" || order?.orderStatus === "CANCELLED";

  // Render
  if (loading) return <div className="text-center p-10 text-xl font-semibold animate-pulse">Loading…</div>;
  if (!order) return <div className="text-center p-10">Order not found</div>;

  // Build messages timeline (most recent first)
  const messages = (order.deliveryMessages || []).map((m) =>
    typeof m === "string" ? { text: m, createdAt: new Date().toISOString() } : { text: m.text || m.message, createdAt: m.createdAt || m.timestamp }
  ).reverse();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline mb-4">← Back</button>

      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">

        {/* Header */}
        <div className="flex justify-between mb-6 pb-4 border-b">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Order #{order.id}</h2>
            <p className="text-gray-500 text-sm mt-1">Placed: {formatDateTime(order.createdDate || order.createdAt)}</p>
            <p className="text-sm text-slate-500 mt-1">Courier: {order.courierName || "—"} {order.courierTrackingId ? ` • ${order.courierTrackingId}` : ""}</p>
          </div>

          <div className="text-right">
            <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow ${order.orderStatus === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
              {STATUS_LABELS[order.orderStatus] || order.orderStatus}
            </span>

            <div className="mt-2 flex gap-2 justify-end">
              {/* Refresh */}
              <button onClick={load} className="px-3 py-1 bg-white border rounded text-sm">Refresh</button>

              {/* Quick jump to courier tracking URL if present */}
              {order.courierTrackUrl && order.courierTrackingId && (
                <a href={(order.courierTrackUrl || "") + (order.courierTrackUrl.endsWith("/") ? order.courierTrackingId : "/" + order.courierTrackingId)} target="_blank" rel="noreferrer"
                   className="px-3 py-1 bg-white border rounded text-sm">
                  Open Courier
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Grid: left details & right messages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">

            {/* Customer */}
            <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-gray-700">Customer Info</h3>
              <p><strong>Address:</strong> {order.userAddress}</p>
              <p><strong>Phone:</strong> {order.phoneNumber}</p>
              <p><strong>Amount:</strong> ₹{Number(order.amount || 0).toFixed(2)}</p>
            </div>

            {/* Items */}
            <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">Items</h3>
              <ul className="space-y-2">
                {order.orderedItems?.map((it, idx) => (
                  <li key={idx} className="flex justify-between py-1">
                    <span className="text-slate-800">{it.name}</span>
                    <span className="text-gray-500">×{it.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tracking / Actions (partner-only editable) */}
            <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">Delivery / Tracking</h3>

              <div className="flex gap-3 mb-3">
                <input className="border p-2 rounded w-full shadow-sm" placeholder="Courier Name" value={order.courierName || partnerName || ""} onChange={(e) => setOrder({ ...order, courierName: e.target.value })} disabled={!isPartner} />
                <input className="border p-2 rounded w-full shadow-sm" placeholder="Tracking ID" value={order.courierTrackingId || ""} onChange={(e) => setOrder({ ...order, courierTrackingId: e.target.value })} disabled={!isPartner} />
              </div>

              <div className="flex gap-3 flex-wrap">
                {isPartner && (
                  <>
                    <button onClick={startScanner} className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300">📷 Scan</button>
                    <button onClick={saveTrackingToServer} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Save Tracking</button>

                  </>
                )}

                {/* For users / partners: quick link to open tracking if available */}
                {order.courierTrackUrl && order.courierTrackingId && (
                  <a className="px-4 py-2 bg-white border rounded-xl text-sm" href={(order.courierTrackUrl || "") + (order.courierTrackUrl.endsWith("/") ? order.courierTrackingId : "/" + order.courierTrackingId)} target="_blank" rel="noreferrer">
                    Open Tracking
                  </a>
                )}
              </div>
            </div>

            {/* Status Timeline + action buttons */}
            <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-lg mb-4 text-gray-700">Status Progress</h3>

              {/* Progress bar */}
              <div className="relative w-full h-3 bg-gray-300 rounded-full overflow-hidden mb-3">
                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700 ease-out" style={{ width: `${Math.max(0, ((currentIndex + 1) / STATUS_FLOW.length) * 100)}%` }} />
              </div>

              <div className="flex justify-between mt-3 text-xs text-gray-600">
                {STATUS_FLOW.map((s, i) => <div key={s} className="text-center w-full">{STATUS_LABELS[s]}</div>)}
              </div>

              {/* Action buttons (partners only) */}
              <div className="flex flex-wrap gap-3 mt-5">
                {ACTIONS.map((s) => {
                  const isCurrent = order.orderStatus === s;
                  const can = canUpdateTo(s);
                  return (
                    <button key={s} disabled={!can || isUpdating || isFinal} onClick={() => updateStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-semibold ${isCurrent ? "bg-gray-200 text-gray-700" : can ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-400"}`}>
                      {STATUS_LABELS[s] || s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messaging */}
            <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">Send Message</h3>

              <textarea rows="3" value={messageText} onChange={(e) => setMessageText(e.target.value)} className="w-full border p-2 rounded-lg shadow-sm mb-3" placeholder={isPartner ? "Message to customer (partner note)..." : "Message / query..."} />

              <div className="flex gap-3">
                <button onClick={sendMessage} disabled={sendingMessage} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Send</button>
                <button onClick={() => setMessageText("Your order has been shipped")} className="px-4 py-2 bg-gray-200 rounded-xl">Quick: shipped</button>
                <button onClick={() => setMessageText("Your item has arrived at our office")} className="px-4 py-2 bg-gray-200 rounded-xl">Quick: arrived</button>
              </div>
            </div>

          </div>

          {/* RIGHT — Messages / timeline */}
          <aside className="bg-slate-50 p-5 rounded-xl border shadow-sm h-fit">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Delivery Messages</h3>

            <div className="space-y-3 max-h-[520px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages yet</p>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-white rounded-xl border shadow-sm">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">DP</div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">{m.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(m.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Scanner modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-3">Scan Barcode</h3>
            <video ref={videoRef} className="w-full rounded shadow" playsInline muted />
            <div className="mt-4 flex gap-2">
              <button onClick={stopScanner} className="w-full bg-red-600 text-white p-2 rounded-xl hover:bg-red-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* POD + Attempt modals */}
      <PODModal open={podOpen} onClose={() => { setPodOpen(false); load(); }} orderId={order?.id} />
      <AttemptModal open={attemptOpen} onClose={() => { setAttemptOpen(false); load(); }} orderId={order?.id} />
    </div>
  );
}
