// src/components/Layout.jsx
import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { Package, Settings, Home, MapPinned, WifiOff, Wifi } from "lucide-react";
import GpsTracker from "../components/GpsTracker";
import { GpsContext } from "../context/GpsContext";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const [online, setOnline] = useState(true);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const { activeOrderId } = useContext(GpsContext);

  const menu = [
    { label: "Orders", icon: <Home className="w-5 h-5" />, to: "/orders" },
    { label: "Hub", icon: <MapPinned className="w-5 h-5" />, to: "/hub-orders" },
    { label: "Settings", icon: <Settings className="w-5 h-5" />, to: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-slate-100">

      {/* LEFT SIDEBAR — Desktop only */}
      <aside className="hidden md:flex w-64 bg-white border-r shadow-xl flex-col">
        <div className="px-5 py-4 border-b flex items-center gap-3">
          <img src={assets.second_logo} alt="logo" className="w-10 h-10 rounded-full shadow" />
          <h1 className="text-lg font-bold text-indigo-700 tracking-tight">
            Delivery Partner
          </h1>
        </div>

        <nav className="flex-1 px-3 pt-4 space-y-1">
          {menu.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all 
                ${
                  active
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.icon}
                <span className="font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer toggles */}
        <div className="px-4 py-3 border-t">
          {/* Online Switch */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {online ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm">{online ? "Online" : "Offline"}</span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={online}
                onChange={() => setOnline(!online)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-indigo-600 transition" />
            </label>
          </div>

          {/* GPS Toggle */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-slate-700">GPS</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={gpsEnabled}
                onChange={() => setGpsEnabled(!gpsEnabled)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-indigo-600 transition" />
            </label>
          </div>

          <div className="mt-3">
            <GpsTracker
              enabled={gpsEnabled}
              partnerId="PARTNER_1"
              currentOrderId={activeOrderId}
            />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 p-5">
        {children}
      </main>

      {/* MOBILE NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-xl border-t flex justify-around py-2 z-50">
        {menu.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center text-xs transition ${
                active ? "text-indigo-600 font-semibold" : "text-slate-500"
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  active ? "bg-indigo-100" : "bg-slate-100"
                }`}
              >
                {item.icon}
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
