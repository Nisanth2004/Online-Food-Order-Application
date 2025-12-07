import React, { useEffect, useState, useContext } from "react";
import { PartnerContext } from "../context/PartnerContext";
import toast from "react-hot-toast";
import api from "../utils/api";
import { CheckCircle, Loader2 } from "lucide-react";

export default function Settings() {
  const { partnerName, savePartnerName } = useContext(PartnerContext);

  const [couriers, setCouriers] = useState([]);
  const [selected, setSelected] = useState(partnerName || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCouriers();
  }, []);

  const loadCouriers = async () => {
    try {
      const res = await api.get("/api/admin/couriers/public");
      setCouriers(res.data);
    } catch (err) {
      toast.error("Failed to load couriers");
    }
    setLoading(false);
  };

  const save = () => {
    if (!selected) {
      toast.error("Please select your courier");
      return;
    }
    savePartnerName(selected);
    toast.success("Courier saved");
  };

  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your courier partner.</p>
      </div>

      {/* CARD */}
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-xl">

        <label className="block text-sm font-medium text-slate-600 mb-2">
          Select Your Courier Partner
        </label>

        <div className="relative mb-5">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="animate-spin w-5 h-5" />
              Loading couriers…
            </div>
          ) : (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full border border-slate-300 text-slate-700 bg-white px-4 py-2.5 rounded-lg shadow-sm 
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              <option value="">-- Select Courier --</option>
              {couriers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={save}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 
          text-white py-2.5 rounded-lg shadow-md font-medium transition"
        >
          <CheckCircle className="w-5 h-5" />
          Save Courier
        </button>

        {/* Current Courier */}
        <div className="mt-6 text-sm">
          <span className="font-semibold text-slate-600">Current Courier: </span>
          {partnerName ? (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {partnerName}
            </span>
          ) : (
            <em className="text-slate-400">Not selected</em>
          )}
        </div>

      </div>
    </div>
  );
}
