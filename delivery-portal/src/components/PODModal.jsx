import React, { useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

export default function PODModal({ open, orderId, onClose }) {
  const [file, setFile] = useState(null);
  if (!open) return null;

  const upload = async () => {
    if (!file) return toast.error("Select file");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post(`/delivery-boy/${orderId}/pod`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("POD uploaded");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-full max-w-md">
        <h3 className="font-semibold mb-3">Upload POD</h3>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
        <div className="mt-3 flex gap-2">
          <button onClick={upload} className="px-3 py-1 bg-indigo-600 text-white rounded">Upload</button>
          <button onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}
