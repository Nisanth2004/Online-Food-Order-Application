import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function HubOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const normalize = (s) => s?.trim()?.toUpperCase();

  const load = async () => {
    try {
      const res = await api.get("/api/orders/all");
      const all = res.data || [];

      const filtered = all.filter(
        (o) =>
          normalize(o.orderStatus) === "ORDER_AT_HUB" ||
          normalize(o.orderStatus) === "OUT_FOR_DELIVERY"
      );

      setOrders(filtered);
    } catch (err) {
      toast.error("Failed to load hub orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const statusColor = (status) => {
    switch (status) {
      case "ORDER_AT_HUB":
        return "bg-blue-500";
      case "OUT_FOR_DELIVERY":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
        📦 Hub Orders Ready for Delivery
      </h2>

      {loading && <div className="text-center text-gray-500">Loading…</div>}

      {!loading && orders.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No orders available at hub.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => navigate(`/hub/order/${order.id}`)}
            className="
              bg-white shadow-md rounded-2xl p-4 border border-gray-200
              active:scale-[0.98] transition-all duration-150
              cursor-pointer
            "
          >
            {/* Order ID + Amount */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">Order #{order.id}</p>
              <p className="text-lg font-bold text-gray-800">
                ₹{order.amount}
              </p>
            </div>

            {/* Items */}
            <p className="text-gray-700 text-sm mb-2">
              {order.orderedItems
                ?.map((i) => `${i.name} x${i.quantity}`)
                .join(", ")}
            </p>

            {/* Customer info */}
            <p className="text-gray-500 text-sm">📞 {order.phoneNumber}</p>
            <p className="text-gray-500 text-sm truncate">
              📍 {order.userAddress}
            </p>

            {/* Status tag */}
            <div className="mt-3">
              <span
                className={`
                  text-white px-3 py-1 text-xs rounded-full 
                  ${statusColor(normalize(order.orderStatus))}
                `}
              >
                {normalize(order.orderStatus)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
