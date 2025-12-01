import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { PartnerContext } from "../context/PartnerContext";
import toast from "react-hot-toast";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function OrderDetails() {
  const { id } = useParams();
  const { partnerName } = useContext(PartnerContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showScanner, setShowScanner] = useState(false);

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
    try {
      await api.patch(`/api/orders/status/${id}`, null, { params: { status } });
      toast.success("Status updated to " + status);
      setOrder((p) => ({ ...p, orderStatus: status }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  // send custom message: tries server endpoint, otherwise falls back to local
  const sendMessage = async () => {
    if (!messageText.trim()) return toast.error("Enter a message");
    setSendingMessage(true);
    try {
      // Try server endpoint (may not exist)
      await api.post(`/api/orders/partner/${id}/message`, { message: messageText });
      // If successful, reload to pick server-side messages if your backend stores them
      toast.success("Message sent to server");
      load();
    } catch (err) {
      // fallback: keep message client-side in state and inform user the server didn't accept
      console.warn("Server message endpoint failed:", err?.response?.status);
      toast("Server message API not available — saved locally", { icon: "⚠️" });
      setOrder((prev) => ({
        ...prev,
        deliveryMessages: [...(prev.deliveryMessages || []), messageText]
      }));
    } finally {
      setMessageText("");
      setSendingMessage(false);
    }
  };

  // Camera barcode scanner (for quick tracking id fill)
  const startScanner = async () => {
    setShowScanner(true);
    codeReader.current = new BrowserMultiFormatReader();
    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const preferred = devices.find(d => /back|rear|environment/i.test(d.label)) || devices[0];
      const deviceId = preferred?.deviceId;
      codeReader.current.decodeFromVideoDevice(deviceId || null, videoRef.current, (result, err) => {
        if (result) {
          const text = result?.text || String(result);
          setOrder((p) => ({ ...p, courierTrackingId: text }));
          toast.success("Scanned: " + text);
          stopScanner();
        }
      });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: deviceId ? { exact: deviceId } : undefined, facingMode: "environment" }});
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

  // Save tracking id — this calls admin courier endpoint (may require admin privileges).
  // If backend expects admin auth, this may fail; admin route ideally should be replaced by partner-specific API.
  const saveTrackingToServer = async () => {
    if (!order?.courierName || !order?.courierTrackingId) {
      return toast.error("Please set courier name and tracking id");
    }
    try {
      await api.put(`/api/orders/admin/courier/${id}`, {
        courierName: order.courierName,
        courierTrackingId: order.courierTrackingId
      });
      toast.success("Tracking saved and SMS attempted by server");
      load();
    } catch (err) {
      console.error(err);
      toast.error("Server refused to save tracking (requires admin). Saved locally instead.");
      // fallback local store
      setOrder((p) => ({ ...p, courierName: order.courierName, courierTrackingId: order.courierTrackingId }));
    }
  };

  if (loading) return <div className="container page">Loading...</div>;
  if (!order) return <div className="container page">Order not found</div>;

  return (
    <div className="container page">
      <button className="btn" onClick={() => navigate(-1)}>⬅ Back</button>

      <h2>Order #{order.id}</h2>
      <div className="card">
        <div><strong>Customer:</strong> {order.userAddress}</div>
        <div><strong>Phone:</strong> {order.phoneNumber}</div>
        <div><strong>Amount:</strong> ₹{order.amount.toFixed(2)}</div>
        <div><strong>Status:</strong> <span className="badge">{order.orderStatus}</span></div>

        <hr />
        <h4>Items</h4>
        <ul>
          {(order.orderedItems || []).map((it, idx) => (
            <li key={idx}>{it.name} x{it.quantity}</li>
          ))}
        </ul>

        <hr />
        <h4>Delivery / Tracking</h4>
        <div className="form-row">
          <input placeholder="Courier name" value={order.courierName || partnerName || ""} onChange={(e) => setOrder({...order, courierName: e.target.value})} />
          <input placeholder="Tracking ID" value={order.courierTrackingId || ""} onChange={(e) => setOrder({...order, courierTrackingId: e.target.value})} />
          <button onClick={startScanner}>Scan</button>
          <button onClick={saveTrackingToServer}>Save Tracking</button>
        </div>

        <hr />
        <h4>Actions</h4>
        <div className="actions">
          <button className="btn" onClick={() => updateStatus("PREPARING")}>In Kitchen</button>
          <button className="btn" onClick={() => updateStatus("OUT_FOR_DELIVERY")}>Out For Delivery</button>
          <button className="btn" onClick={() => updateStatus("DELIVERED")}>Delivered</button>
          <button className="btn danger" onClick={() => updateStatus("DELIVERY_FAILED")}>Failed</button>
        </div>

        <hr />
        <h4>Messages</h4>
        <div>
          <textarea rows="3" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message to customer (e.g., 'Left Tirupati hub')"></textarea>
          <div style={{display:"flex", gap:8, marginTop:8}}>
            <button onClick={sendMessage} disabled={sendingMessage} className="btn">Send Message</button>
            <button onClick={() => { setMessageText("Your order has been shipped") }} className="btn ghost">Quick: shipped</button>
            <button onClick={() => { setMessageText("Your item has arrived at our office") }} className="btn ghost">Quick: arrived</button>
          </div>

          <ul className="messages-list">
            {(order.deliveryMessages || []).map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      </div>

      {showScanner && (
        <div className="scanner-modal">
          <div className="scanner-content">
            <h4>Scan barcode</h4>
            <div className="scanner-video">
              <video ref={videoRef} style={{ width: "100%" }} playsInline muted></video>
            </div>
            <div className="mt-2">
              <button className="btn" onClick={stopScanner}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
