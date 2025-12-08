import React, { useState, useContext } from "react";
import api from "../api/api";
import { HubContext } from "../context/HubContext";
import { useNavigate } from "react-router-dom";

export default function HubLogin() {
  const { setHub } = useContext(HubContext);
  const [hubName, setHubName] = useState("");
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/hub/login", { hubName, pin });
      localStorage.setItem("hub", JSON.stringify(res.data));
      setHub(res.data);
      navigate("/hub/dashboard");
    } catch (e) {
      alert("Invalid hub or PIN");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={login}
        className="bg-white p-6 rounded-xl shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Hub Staff Login</h2>

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Hub Name"
          value={hubName}
          onChange={(e) => setHubName(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="PIN"
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
