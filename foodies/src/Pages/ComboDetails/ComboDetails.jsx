import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../service/CustomAxiosInstance";
import { StoreContext } from "../../Context/StoreContext";
import toast from "react-hot-toast";

const ComboDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addComboToCart } = useContext(StoreContext);

  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverNow, setServerNow] = useState(Date.now());
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [status, setStatus] = useState("loading"); // live | upcoming | expired

  /* ---------------- FETCH COMBO ---------------- */
  useEffect(() => {
    api.get(`/api/admin/combos/${id}/details`)
      .then(res => {
        setCombo(res.data);
        setServerNow(res.data.serverTime);
      })
      .catch(() => toast.error("Combo not found"));
  }, [id]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!combo?.endTime) return;

    const interval = setInterval(() => {
      setServerNow(prev => {
        const now = prev + 1000;
        const start = combo.startTime;
        const end = combo.endTime;

        if (now < start) {
          setStatus("upcoming");
          return now;
        }

        const diff = end - now;
        if (diff <= 0) {
          setStatus("expired");
          clearInterval(interval);
          return now;
        }

        setStatus("live");

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        setTime({ d, h, m, s });
        return now;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [combo]);

  if (!combo) {
    return (
      <div className="container mx-auto px-4 py-10 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- PRICE ---------------- */
  const totalMrp = combo.foods.reduce((s, f) => s + f.mrp, 0);
  const savings = totalMrp - combo.comboPrice;
  const theme = combo.themeColor || "#16a34a";

  /* ---------------- ADD TO CART ---------------- */
  const handleAddCombo = async () => {
    if (status !== "live") return;
    setLoading(true);
    await addComboToCart(combo);
    toast.success("Combo added to cart");
    navigate("/cart");
  };

  return (
    <div className="container mx-auto px-4 py-6">

      {/* ---------- HEADER TIMER ---------- */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <h1 className="text-2xl md:text-3xl font-extrabold">
          {combo.name}
        </h1>

        {/* STATUS + TIMER */}
        <div className="flex items-center gap-4">

          {status === "upcoming" && (
            <span className="px-4 py-1 rounded-full bg-yellow-400 font-bold">
              ⚡ Coming Soon
            </span>
          )}

          {status === "expired" && (
            <span className="px-4 py-1 rounded-full bg-red-600 text-white font-bold">
              Deal Expired
            </span>
          )}

          {status === "live" && (
            <div className="flex gap-2 text-center">
              {["d","h","m","s"].map(k => (
                <div
                  key={k}
                  className="bg-black text-white rounded-lg px-3 py-2 min-w-[56px]"
                >
                  <p className="text-lg font-extrabold">{time[k]}</p>
                  <p className="text-xs uppercase">{k}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ---------- IMAGE ---------- */}
      <div className="rounded-3xl overflow-hidden shadow-xl mb-6">
        <img
          src={combo.imageUrl}
          alt={combo.name}
          className="w-full h-[420px] object-cover"
        />
      </div>

      {/* ---------- PRICE SUMMARY ---------- */}
      <div className="bg-green-50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
        <div>
          <p className="text-gray-500">Total MRP</p>
          <p className="line-through text-red-500 font-bold">₹{totalMrp}</p>
        </div>
        <div>
          <p className="text-gray-500">Combo Price</p>
          <p className="text-4xl font-extrabold" style={{ color: theme }}>
            ₹{combo.comboPrice}
          </p>
          <span className="inline-block mt-2 bg-green-600 text-white px-4 py-1 rounded-full">
            Best Deal 🔥
          </span>
        </div>
        <div>
          <p className="text-gray-500">You Save</p>
          <p className="text-green-600 font-bold">₹{savings}</p>
        </div>
      </div>

      {/* ---------- ITEMS ---------- */}
      <h3 className="text-xl font-bold mb-4">Included Items</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {combo.foods.map(food => (
          <div key={food.id} className="flex gap-4 p-4 border rounded-xl hover:shadow-md">
            <img
              src={food.imageUrl}
              alt={food.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div>
              <h4 className="font-semibold">{food.name}</h4>
              <p className="font-bold">₹{food.mrp}</p>
              {food.sellingPrice < food.mrp && (
                <p className="text-green-600 text-sm">
                  Save ₹{food.mrp - food.sellingPrice}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ---------- CTA ---------- */}
      <button
        onClick={handleAddCombo}
        disabled={status !== "live" || loading}
        className="mt-10 w-full py-4 rounded-full text-lg font-bold text-white
                   disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: `linear-gradient(135deg, ${theme}, #22c55e)` }}
      >
        {status === "expired"
          ? "Deal Expired"
          : status === "upcoming"
          ? "Deal Not Started"
          : loading
          ? "Adding Combo..."
          : `Add Combo & Save ₹${savings}`}
      </button>

      <p className="mt-3 text-center text-sm text-gray-500">
        ⚠️ Maximum <strong>2 combos</strong> per order
      </p>

      {/* ---------- MOBILE STICKY CTA ---------- */}
      {status === "live" && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white p-4 shadow-xl">
          <button
            onClick={handleAddCombo}
            className="w-full py-3 rounded-full text-white font-bold"
            style={{ background: theme }}
          >
            Add Combo – ₹{combo.comboPrice}
          </button>
        </div>
      )}
    </div>
  );
};

export default ComboDetails;
