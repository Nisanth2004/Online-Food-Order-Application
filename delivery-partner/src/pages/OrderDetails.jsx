// Professional Delivery Partner UI – FINAL VERSION (Animated + New Theme)
import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { PartnerContext } from "../context/PartnerContext";
import toast from "react-hot-toast";
import { BrowserMultiFormatReader } from "@zxing/browser";

const STATUS_FLOW = [
  "ORDER_PLACED",
  "ORDER_CONFIRMED",
  "ORDER_PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
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

const ACTIONS = [...STATUS_FLOW, "CANCELLED"];

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
    } catch {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (status) => {
    if (!order || order.orderStatus === status) return;
    setIsUpdating(true);

    try {
      await api.patch(`/api/orders/status/${id}`, null, { params: { status } });
      toast.success(`Status updated to ${STATUS_LABELS[status]}`);
      setOrder((p) => ({ ...p, orderStatus: status }));
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return toast.error("Enter a message");
    setSendingMessage(true);

    try {
      await api.post(`/api/orders/partner/${id}/message`, { message: messageText });
      toast.success("Message sent");
      load();
    } catch {
      toast("Saved locally", { icon: "⚠️" });
      setOrder((p) => ({
        ...p,
        deliveryMessages: [
          ...(p.deliveryMessages || []),
          { text: messageText, createdAt: new Date().toISOString() },
        ],
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
      const preferred =
        devices.find((d) => /back|rear|environment/i.test(d.label)) || devices[0];

      const deviceId = preferred?.deviceId;

      codeReader.current.decodeFromVideoDevice(
        deviceId || null,
        videoRef.current,
        (result) => {
          if (result) {
            toast.success("Scanned: " + result.text);
            setOrder((p) => ({ ...p, courierTrackingId: result.text }));
            stopScanner();
          }
        }
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: "environment",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      toast.error("Camera not accessible");
      stopScanner();
    }
  };

  const stopScanner = () => {
    setShowScanner(false);
    try {
      codeReader.current?.reset();
    } catch {}
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const saveTrackingToServer = async () => {
    if (!order?.courierName || !order?.courierTrackingId)
      return toast.error("Set courier name & tracking ID");

    try {
      await api.put(`/api/orders/admin/courier/${id}`, {
        courierName: order.courierName,
        courierTrackingId: order.courierTrackingId,
      });

      toast.success("Tracking ID saved");
      load();
    } catch {
      toast.error("Server refused. Saved locally");
    }
  };

  if (loading)
    return (
      <div className="text-center p-10 text-xl font-semibold animate-pulse">
        Loading…
      </div>
    );

  if (!order) return <div className="text-center p-10">Order not found</div>;

  const currentIndex = STATUS_FLOW.indexOf(order.orderStatus);

  const messages = (order.deliveryMessages || [])
    .map((m) =>
      typeof m === "string"
        ? { text: m, createdAt: new Date().toISOString() }
        : { text: m.text || m.message, createdAt: m.createdAt }
    )
    .reverse();

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 hover:underline mb-4"
      >
        ← Back
      </button>

      {/* Card */}
      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">

        {/* Header */}
        <div className="flex justify-between mb-6 pb-4 border-b">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Order #{order.id}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Placed: {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <span
            className={`px-4 py-2 rounded-xl text-sm font-semibold shadow
              ${
                order.orderStatus === "CANCELLED"
                  ? "bg-red-100 text-red-700"
                  : "bg-emerald-100 text-emerald-700"
              }
            `}
          >
            {STATUS_LABELS[order.orderStatus]}
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="col-span-2 space-y-6">

            {/* Customer Info */}
            <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-lg mb-2 text-gray-700">
                Customer Info
              </h3>
              <p><strong>Address:</strong> {order.userAddress}</p>
              <p><strong>Phone:</strong> {order.phoneNumber}</p>
              <p><strong>Amount:</strong> ₹{order.amount.toFixed(2)}</p>
            </div>

            {/* Items */}
            <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">Items</h3>
              <ul className="space-y-2">
                {order.orderedItems?.map((it, idx) => (
                  <li key={idx} className="flex justify-between py-1">
                    <span>{it.name}</span>
                    <span className="text-gray-500">×{it.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tracking */}
            <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Delivery / Tracking
              </h3>

              <div className="flex gap-3 mb-3">
                <input
                  className="border p-2 rounded w-full shadow-sm"
                  placeholder="Courier Name"
                  value={order.courierName || partnerName || ""}
                  onChange={(e) =>
                    setOrder({ ...order, courierName: e.target.value })
                  }
                />
                <input
                  className="border p-2 rounded w-full shadow-sm"
                  placeholder="Tracking ID"
                  value={order.courierTrackingId || ""}
                  onChange={(e) =>
                    setOrder({ ...order, courierTrackingId: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startScanner}
                  className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
                >
                  📷 Scan
                </button>
                <button
                  onClick={saveTrackingToServer}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Save Tracking
                </button>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-lg mb-4 text-gray-700">
                Status Progress
              </h3>

              <div className="relative w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700 ease-out"
                  style={{
                    width: `${((currentIndex + 1) / STATUS_FLOW.length) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between mt-3 text-xs text-gray-600">
                {STATUS_FLOW.map((s, i) => (
                  <div key={i} className="text-center w-full">
                    {STATUS_LABELS[s]}
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 mt-5">
                {ACTIONS.map((s) => {
                  const isCurrent = order.orderStatus === s;
                  const can =
                    STATUS_FLOW.indexOf(s) > currentIndex || s === "CANCELLED";

                  return (
                    <button
                      key={s}
                      disabled={!can || isUpdating || isCurrent}
                      onClick={() => can && updateStatus(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold
                        ${
                          isCurrent
                            ? "bg-gray-200 text-gray-700"
                            : can
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-gray-100 text-gray-400"
                        }
                      `}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messaging */}
            <div className="bg-slate-50 p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Send Message
              </h3>
              <textarea
                rows="3"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full border p-2 rounded-lg shadow-sm mb-3"
                placeholder="Type a message..."
              />

              <div className="flex gap-3">
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Send
                </button>
                <button
                  onClick={() => setMessageText("Your order has been shipped")}
                  className="px-4 py-2 bg-gray-200 rounded-xl"
                >
                  Quick: shipped
                </button>
                <button
                  onClick={() =>
                    setMessageText("Your item has arrived at our office")
                  }
                  className="px-4 py-2 bg-gray-200 rounded-xl"
                >
                  Quick: arrived
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — Messages */}
          <aside className="bg-slate-50 p-5 rounded-xl border shadow-sm h-fit">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">
              Delivery Messages
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages yet</p>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 bg-white rounded-xl border shadow-sm"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                      DP
                    </div>
                    <div>
                      <p>{m.text}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold mb-3">Scan Barcode</h3>
            <video
              ref={videoRef}
              className="w-full rounded shadow"
              playsInline
              muted
            ></video>

            <button
              onClick={stopScanner}
              className="mt-4 w-full bg-red-600 text-white p-2 rounded-xl hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
