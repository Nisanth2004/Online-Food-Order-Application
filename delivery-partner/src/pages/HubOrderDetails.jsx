import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import AttemptModal from "../components/AttemptModal";
import PODModal from "../components/PODModal";

export default function HubOrderDetails() {
  const { id } = useParams(); // orderId from URL
  const [order, setOrder] = useState(null);

  const [attemptOpen, setAttemptOpen] = useState(false);
  const [podOpen, setPodOpen] = useState(false);

  // -----------------------------
  // LOAD ORDER
  // -----------------------------
  const load = async () => {
    try {
      const res = await api.get(`/api/orders/hub/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load order");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // -----------------------------
  // UPDATE STATUS
  // -----------------------------
  const updateStatus = async (status) => {
    try {
      await api.patch(`/api/orders/status/${id}?status=${status}`);
      toast.success("Status updated");
      load();
    } catch (err) {
      console.log(err);
      toast.error("Update failed");
    }
  };

  if (!order) return <div className="p-10">Loading...</div>;

  // Normalize backend strings
  const status = order.orderStatus?.trim()?.toUpperCase();

  return (
    <div className="container p-5">
      <h2 className="text-2xl font-semibold mb-4">Hub Order #{order.id}</h2>

      <div className="space-y-1">
        <p><strong>Customer:</strong> {order.phoneNumber}</p>
        <p><strong>Address:</strong> {order.userAddress}</p>
        <p><strong>Status:</strong> {status}</p>
      </div>

      {/* -----------------------------
           ORDER AT HUB → Allow Start Delivery
         ----------------------------- */}
      {status === "ORDER_AT_HUB" && (
        <button
          onClick={() => updateStatus("OUT_FOR_DELIVERY")}
          className="btn-primary mt-5"
        >
          Start Out For Delivery
        </button>
      )}

      {/* -----------------------------
           OUT FOR DELIVERY → Attempt / Delivered
         ----------------------------- */}
      {status === "OUT_FOR_DELIVERY" && (
        <div className="mt-5 space-y-3">
          <button
            onClick={() => setAttemptOpen(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Attempt Failed
          </button>

          <button
            onClick={() => setPodOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Delivered (POD Required)
          </button>
        </div>
      )}

      {/* -----------------------------
           ATTEMPT MODAL
         ----------------------------- */}
      <AttemptModal
        open={attemptOpen}
        onClose={() => {
          setAttemptOpen(false);
          load();
        }}
        orderId={order.id}
      />

      {/* -----------------------------
           POD MODAL
         ----------------------------- */}
      <PODModal
        open={podOpen}
        onClose={() => {
          setPodOpen(false);
          load();
        }}
        orderId={order.id}
      />
    </div>
  );
}
