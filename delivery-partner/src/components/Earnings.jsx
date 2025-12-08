// src/pages/Earnings.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function Earnings() {
  const [data, setData] = useState({ today: 0, week: 0, month: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/partner/earnings"); // backend endpoint to support
      setData(res.data || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load earnings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Earnings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">Today</div>
          <div className="text-2xl font-bold mt-2">₹{data.today ?? 0}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">This week</div>
          <div className="text-2xl font-bold mt-2">₹{data.week ?? 0}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <div className="text-sm text-slate-500">This month</div>
          <div className="text-2xl font-bold mt-2">₹{data.month ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
