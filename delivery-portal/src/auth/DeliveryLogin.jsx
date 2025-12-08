import React, { useState, useContext } from "react";
import api from "../api/api";
import { DeliveryContext } from "../context/DeliveryContext";
import { useNavigate } from "react-router-dom";

export default function DeliveryLogin() {
  const { setDeliveryBoy } = useContext(DeliveryContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/delivery-boy/login", { email, password });
      localStorage.setItem("deliveryBoy", JSON.stringify(res.data));
      setDeliveryBoy(res.data);
      navigate("/delivery/dashboard");
    } catch (e) {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={login}
        className="bg-white p-6 rounded-xl shadow-md w-80"
      >
        <h2 className="text-xl font-bold mb-4">Delivery Partner Login</h2>

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
