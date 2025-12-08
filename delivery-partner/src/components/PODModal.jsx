// src/components/PODModal.jsx
import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import api from "../utils/api";
import toast from "react-hot-toast";

/**
 * Props:
 * - open (bool), onClose(), orderId
 */
export default function PODModal({ open, onClose, orderId }) {
  const sigRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const clearSig = () => sigRef.current?.clear();

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(file);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) return toast.error("Enter customer name");
    if (sigRef.current.isEmpty()) return toast.error("Capture signature");

    setSubmitting(true);
    try {
      const sigData = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
      const form = new FormData();
      form.append("orderId", orderId);
      form.append("customerName", customerName);
      form.append("signature", dataURLtoBlob(sigData), "signature.png");
      if (photo) form.append("photo", photo);

      await api.post("/api/orders/pod", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("POD submitted");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("POD submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(","), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Proof of Delivery</h3>
          <button onClick={onClose} className="text-slate-500">✖</button>
        </div>

        <label className="block text-sm mb-2">Customer name</label>
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3" placeholder="Name on receipt" />

        <label className="block text-sm mb-2">Signature</label>
        <div className="border rounded mb-2">
          <SignatureCanvas ref={sigRef} canvasProps={{ className: "w-full h-40" }} />
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={clearSig} className="px-3 py-1 bg-gray-100 rounded">Clear</button>
        </div>

        <label className="block text-sm mb-2">Photo (optional)</label>
        <input type="file" accept="image/*" onChange={handlePhoto} className="mb-4" />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
          <button disabled={submitting} onClick={handleSubmit} className="px-4 py-2 rounded bg-indigo-600 text-white">
            {submitting ? "Submitting..." : "Submit POD"}
          </button>
        </div>
      </div>
    </div>
  );
}
