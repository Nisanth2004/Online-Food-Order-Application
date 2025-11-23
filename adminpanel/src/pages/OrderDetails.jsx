// FULL FILE WITH ORDER ITEMS TABLE + CAMERA + BARCODE

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BrowserMultiFormatReader } from "@zxing/browser";

const formatDate = (dateStr) => {
  if (!dateStr) return "Not Available";
  const d = new Date(dateStr);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};

const parseAddress = (address) => {
  if (!address) return {};
  const parts = address.split(",").map((p) => p.trim());
  return {
    name: parts[0] || "Not Available",
    street: parts[1] || "Not Available",
    city: parts[2] || "Not Available",
    state: parts[3] || "Not Available",
    pinCode: parts[4] || "Not Available",
  };
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [courierName, setCourierName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [updating, setUpdating] = useState(false);
  const [courierList, setCourierList] = useState([]);

  // camera scanner
  const [showScanner, setShowScanner] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);

  // Load Data
  const fetchCouriers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/couriers");
      setCourierList(res.data || []);
    } catch (err) {
      console.error("Failed to load couriers:", err);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/orders/admin/${id}`
      );
      setOrder(response.data);
      setCourierName(response.data.courierName || "");
      setTrackingId(response.data.courierTrackingId || "");
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchCouriers();
  }, [id]);

  // USB Scanner
  useEffect(() => {
    let buffer = "";
    let lastTime = Date.now();

    const handler = (e) => {
      const now = Date.now();
      if (now - lastTime > 50) buffer = "";
      lastTime = now;

      if (e.key === "Enter") {
        if (buffer.length > 3) {
          setTrackingId(buffer);
          toast.success("Barcode scanned!");
        }
        buffer = "";
        return;
      }
      if (e.key.length === 1) buffer += e.key;
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Camera Scanner
  const startCameraScanner = async () => {
    if (!("mediaDevices" in navigator)) {
      toast.error("Camera not supported");
      return;
    }

    setHasScanned(false);
    setShowScanner(true);
    codeReader.current = new BrowserMultiFormatReader();

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const preferred =
        devices.find((d) => /back|rear|environment/i.test(d.label)) ||
        devices[0];
      const deviceId = preferred?.deviceId;

      codeReader.current.decodeFromVideoDevice(
        deviceId || null,
        videoRef.current,
        (result, err) => {
          if (result && !hasScanned) {
            setHasScanned(true);
            const text = result.text || String(result);
            setTrackingId(text);
            setTimeout(() => stopCameraScanner(), 200);
          }
        }
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: "environment",
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      toast.error("Camera error");
      stopCameraScanner();
    }
  };

  const stopCameraScanner = () => {
    setShowScanner(false);
    setHasScanned(false);

    try {
      codeReader.current?.reset();
      codeReader.current = null;
    } catch {}

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Save Courier Info
  const updateCourierInfo = async () => {
    if (!courierName || !trackingId) {
      toast.error("Please select courier & tracking ID");
      return;
    }

    setUpdating(true);
    try {
      await axios.put(
        `http://localhost:8080/api/orders/admin/courier/${id}`,
        {
          courierName,
          courierTrackingId: trackingId,
        }
      );

      toast.success("Courier updated!");

      setOrder((prev) => ({
        ...prev,
        courierName,
        courierTrackingId: trackingId,
        orderStatus: "OUT_FOR_DELIVERY",
      }));

      setCourierName("");
      setTrackingId("");
    } catch (err) {
      toast.error("Failed to update courier");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <h3 className="text-center mt-5">Loading...</h3>;
  if (!order) return <h3 className="text-center mt-5">Order Not Found</h3>;

  const orderAddress = parseAddress(order.userAddress);

  return (
    <div className="container mt-4">
      <button className="btn btn-outline-dark mb-3" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <div className="card p-4">
        <h3>Order #{order.id}</h3>

        {/* ORDER ITEMS TABLE (ADDED BACK) */}
        <h4 className="mt-4">Order Items</h4>
        <table className="table table-bordered mt-2">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order?.orderedItems?.length > 0 ? (
              order.orderedItems.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price}</td>
                  <td>₹{item.quantity * item.price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <hr />

        <strong>Customer Details</strong>
        <div className="border rounded p-3 mt-2" style={{ background: "#f8f9fa" }}>
          <p><strong>Name:</strong> {orderAddress.name}</p>
          <p><strong>Address:</strong> {orderAddress.street}</p>
          <p><strong>City:</strong> {orderAddress.city}</p>
          <p><strong>State:</strong> {orderAddress.state}</p>
          <p><strong>Pincode:</strong> {orderAddress.pinCode}</p>
        </div>

        <p className="mt-3"><strong>Date:</strong> {formatDate(order.createdDate)}</p>
        <p><strong>Status:</strong> {order.orderStatus}</p>

        {/* Courier Info */}
        <h4 className="mt-4">Courier Information</h4>
        <div className="p-3 border rounded" style={{ background: "#f1f1f1" }}>
          <div className="mb-3">
            <label><strong>Select Courier</strong></label>
            <select
              className="form-control"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
            >
              <option value="">-- Select Courier --</option>
              {courierList.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label><strong>Tracking ID</strong></label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <button className="btn btn-secondary">🔍 Scan</button>
              <button className="btn btn-dark" onClick={startCameraScanner}>
                📷 Camera
              </button>
            </div>
          </div>

          <button className="btn btn-primary" onClick={updateCourierInfo}>
            Save
          </button>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {showScanner && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 8,
              width: "92%",
              maxWidth: 520,
              textAlign: "center",
            }}
          >
            <h4>Scan Barcode</h4>

            <div
              style={{
                width: "100%",
                height: 360,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#000",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <video
                ref={videoRef}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                playsInline
                muted
                autoPlay
              />
            </div>

            <button className="btn btn-secondary mt-3" onClick={stopCameraScanner}>
              Close Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
