import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { HubContext } from "../context/HubContext";
import toast from "react-hot-toast";

export default function HubOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hub } = useContext(HubContext);

  const [order, setOrder] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/orders/admin/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const addHubUpdate = async () => {
    if (!msg.trim()) return toast.error("Enter message");
    try {
      await api.post(`/hub/order/${id}/update`, { hubName: hub.hubName, staffName: hub.staffName, message: msg });
      toast.success("Hub update added");
      setMsg("");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => navigate(-1)} className="text-indigo-600">← Back</button>
        <h2 className="text-xl font-semibold">Order {order.id}</h2>
        <div />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Customer</h3>
          <p><strong>Address:</strong> {order.userAddress}</p>
          <p><strong>Phone:</strong> {order.phoneNumber}</p>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">Add Hub Update</h4>
            <textarea className="w-full border p-2 rounded mb-2" rows="3" value={msg} onChange={(e) => setMsg(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={addHubUpdate} className="px-3 py-1 bg-indigo-600 text-white rounded">Add Update</button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Hub History</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(order.hubHistory || []).slice().reverse().map((h, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded">
                  <div className="text-sm">{h.message}</div>
                  <div className="text-xs text-slate-400 mt-1">{h.hubName} • {h.staffName} • {new Date(h.time).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Status</h3>
            <div>{order.orderStatus}</div>
            <div className="text-xs mt-2">
              {order.statusTimestamps && Object.entries(order.statusTimestamps).map(([k,v]) => <div key={k}><strong>{k}</strong>: {new Date(v).toLocaleString()}</div>)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
