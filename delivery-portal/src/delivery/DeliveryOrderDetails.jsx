import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { DeliveryContext } from "../context/DeliveryContext";
import toast from "react-hot-toast";
import PODModal from "../components/PODModal";
import AttemptModal from "../components/AttemptModal";

export default function DeliveryOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deliveryBoy } = useContext(DeliveryContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [podOpen, setPodOpen] = useState(false);
  const [attemptOpen, setAttemptOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [messageText, setMessageText] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/orders/admin/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const markOutForDelivery = async () => {
    setIsUpdating(true);
    try {
      await api.post(`/delivery/actions/${id}/out-for-delivery`);
      toast.success("Marked out for delivery");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed");
    } finally { setIsUpdating(false); }
  };

  const markDelivered = async () => {
    setIsUpdating(true);
    try {
      await api.post(`/delivery/actions/${id}/delivered`, { deliveryBoy: deliveryBoy?.name || "delivery-boy" });
      toast.success("Marked delivered");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed");
    } finally { setIsUpdating(false); }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return toast.error("Enter message");
    try {
      await api.post(`/api/orders/partner/${id}/message`, { message: messageText, actor: deliveryBoy?.name || "delivery-boy" });
      toast.success("Message sent");
      setMessageText("");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  const messages = (order.deliveryMessages || []).map(m => ({
    text: m.message || m.text,
    time: m.timestamp || m.time || m.createdAt
  })).reverse();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-indigo-600">← Back</button>
        <h2 className="text-xl font-semibold">Order #{order.id}</h2>
        <div />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Customer</h3>
            <p><strong>Address:</strong> {order.userAddress}</p>
            <p><strong>Phone:</strong> {order.phoneNumber}</p>
            <p><strong>Amount:</strong> ₹{Number(order.amount).toFixed(2)}</p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Actions</h3>
            <div className="flex gap-2 flex-wrap">
              <button onClick={markOutForDelivery} disabled={isUpdating} className="px-3 py-1 bg-yellow-500 text-white rounded">Out for Delivery</button>
              <button onClick={() => setAttemptOpen(true)} className="px-3 py-1 bg-orange-500 text-white rounded">Record Attempt</button>
              <button onClick={() => setPodOpen(true)} className="px-3 py-1 bg-gray-700 text-white rounded">Upload POD</button>
              <button onClick={markDelivered} disabled={isUpdating} className="px-3 py-1 bg-green-600 text-white rounded">Delivered</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Send Message</h3>
            <textarea className="w-full border p-2 rounded mb-2" rows="3" value={messageText} onChange={(e)=>setMessageText(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={sendMessage} className="px-3 py-1 bg-indigo-600 text-white rounded">Send</button>
              <button onClick={() => setMessageText("Attempted delivery - customer not available")} className="px-3 py-1 border rounded">Quick: Attempt</button>
            </div>
          </div>

        </div>

        <aside className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Status</h3>
            <div className="text-sm mb-2">{order.orderStatus}</div>
            <div className="text-xs text-slate-500">Timestamps:</div>
            <ul className="text-xs space-y-1 mt-2">
              {order.statusTimestamps && Object.entries(order.statusTimestamps).map(([k,v]) => (
                <li key={k}><strong>{k}:</strong> {new Date(v).toLocaleString()}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Delivery Messages</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {messages.length === 0 ? <div className="text-slate-500">No messages</div> : messages.map((m,i)=>(
                <div key={i} className="p-2 bg-slate-50 rounded">
                  <div className="text-sm">{m.text}</div>
                  <div className="text-xs text-slate-400 mt-1">{new Date(m.time).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">POD</h3>
            {order.podImageUrls && order.podImageUrls.length > 0 ? (
              order.podImageUrls.map((u, idx) => (
                <a key={idx} className="block text-indigo-600 truncate" href={u} target="_blank" rel="noreferrer">POD #{idx+1}</a>
              ))
            ) : <div className="text-slate-500">No PODs</div>}
          </div>
        </aside>
      </div>

      <PODModal open={podOpen} orderId={order.id} onClose={() => { setPodOpen(false); load(); }} />
      <AttemptModal open={attemptOpen} orderId={order.id} onClose={() => { setAttemptOpen(false); load(); }} />
    </div>
  );
}
