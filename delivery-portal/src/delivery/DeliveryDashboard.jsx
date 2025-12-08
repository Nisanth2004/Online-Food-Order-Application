import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { DeliveryContext } from "../context/DeliveryContext";
import toast from "react-hot-toast";

export default function DeliveryDashboard() {
  const { deliveryBoy } = useContext(DeliveryContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      if (!deliveryBoy) {
        setOrders([]);
        return;
      }
      // backend: get assigned orders by filtering /api/orders/all
      const res = await api.get("/api/orders/all");
      const all = res.data || [];
      const assigned = all.filter(o => o.assignedDeliveryBoyId === deliveryBoy.id || o.courierName === deliveryBoy.name || o.assignedDeliveryBoyId === deliveryBoy.id);
      setOrders(assigned);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [deliveryBoy]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
        <div className="text-sm text-slate-600">Signed in as <strong>{deliveryBoy?.name}</strong></div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Assigned Orders</h2>
          <div>
            <button onClick={load} className="px-3 py-1 bg-white border rounded">Refresh</button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No assigned orders</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2">Order</th>
                  <th className="text-left px-4 py-2">Phone</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Amount</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b">
                    <td className="px-4 py-2">{o.id}</td>
                    <td className="px-4 py-2">{o.phoneNumber}</td>
                    <td className="px-4 py-2">{o.orderStatus}</td>
                    <td className="px-4 py-2">₹{Number(o.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => navigate(`/delivery/order/${o.id}`)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
