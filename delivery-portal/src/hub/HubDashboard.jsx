import React, { useContext, useEffect, useState } from "react";
import { HubContext } from "../context/HubContext";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function HubDashboard() {
  const { hub } = useContext(HubContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      // backend provides getOrdersForHub: GET /hub/order/orders?hubName=NAME
      const res = await api.get(`/hub/order/orders?hubName=${encodeURIComponent(hub?.hubName || "")}`);
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load hub orders");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (hub) load(); }, [hub]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Hub: {hub?.hubName}</h1>
        <div className="text-sm">{hub?.staffName}</div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Orders at Hub</h2>
          <button onClick={load} className="px-3 py-1 border rounded">Refresh</button>
        </div>

        {loading ? <div className="p-4">Loading…</div> : orders.length === 0 ? (
          <div className="p-4 text-slate-500">No orders at your hub</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Order</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Courier</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o=>(
                <tr key={o.id} className="border-b">
                  <td className="px-3 py-2">{o.id}</td>
                  <td className="px-3 py-2">{o.orderStatus}</td>
                  <td className="px-3 py-2">{o.courierName || "-"}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => navigate(`/hub/order/${o.id}`)} className="px-2 py-1 bg-indigo-600 text-white rounded">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
