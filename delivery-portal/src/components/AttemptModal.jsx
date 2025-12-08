import React, { useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

export default function AttemptModal({ open, orderId, onClose }) {
  const [reason, setReason] = useState("CUSTOMER_NOT_AVAILABLE");
  const [note, setNote] = useState("");

  if (!open) return null;

  const submit = async () => {
    try {
      await api.post(`/delivery/actions/${orderId}/attempt`, { reason });
      if (note) {
        await api.post(`/api/orders/partner/${orderId}/message`, { message: `Attempt note: ${note}`, actor: "delivery-boy" });
      }
      toast.success("Attempt recorded");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-full max-w-md">
        <h3 className="font-semibold mb-3">Record Attempt</h3>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border p-2 mb-3">
          <option value="CUSTOMER_NOT_AVAILABLE">Customer not available</option>
          <option value="ADDRESS_NOT_FOUND">Address not found</option>
          <option value="PAYMENT_FAILED">Payment failed</option>
          <option value="CONTACT_NUMBER_INVALID">Contact invalid</option>
          <option value="OTHER">Other</option>
        </select>
        <textarea className="w-full border p-2 mb-3" rows="3" placeholder="Optional note" value={note} onChange={(e)=>setNote(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={submit} className="px-3 py-1 bg-yellow-500 text-white rounded">Record</button>
          <button onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}
