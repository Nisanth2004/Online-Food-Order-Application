// src/components/AttemptModal.jsx
import React, { useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

/**
 * Props: open, onClose, orderId
 */
export default function AttemptModal({ open, onClose, orderId }) {
  const [reason, setReason] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submitAttempt = async () => {
    if (!reason.trim()) return toast.error("Please add reason");
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("orderId", orderId);
      form.append("reason", reason);
      if (photo) form.append("photo", photo);

      await api.post("/api/orders/attempted", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Attempt recorded");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to record attempt");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Attempted Delivery</h3>
          <button onClick={onClose} className="text-slate-500">✖</button>
        </div>

        <label className="block text-sm mb-2">Reason</label>
        <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" />

        <label className="block text-sm mb-2">Photo (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0])} className="mb-4" />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
          <button disabled={submitting} onClick={submitAttempt} className="px-4 py-2 rounded bg-indigo-600 text-white">
            {submitting ? "Saving..." : "Save Attempt"}
          </button>
        </div>
      </div>
    </div>
  );
}
