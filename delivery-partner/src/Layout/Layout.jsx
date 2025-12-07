import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";

// Premium Lucide Icons
import {
  Package,
  Settings,
  Menu,
  ChevronRight,
} from "lucide-react";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { label: "Orders", icon: <Package className="w-5 h-5" />, to: "/orders" },
    { label: "Settings", icon: <Settings className="w-5 h-5" />, to: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-slate-100">

      {/* SIDEBAR */}
      <aside
        className={`relative bg-white shadow-xl border-r transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        flex flex-col`}
      >
        {/* TOP LOGO + TOGGLE */}
        <div className="flex items-center justify-between px-5 py-4 border-b">

          {/* Company Logo + Name */}
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img
                src={assets.second_logo}
                alt="logo"
                className="w-10 h-10 rounded-full shadow"
              />
              <h1 className="text-lg font-bold text-indigo-700 tracking-tight">
                Delivery Partner
              </h1>
            </div>
          )}

          {/* Collapsed logo */}
          {collapsed && (
            <img
              src={assets.second_logo}
              alt="logo"
              className="w-10 h-10 rounded-full mx-auto shadow"
            />
          )}

          {/* Toggle button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-slate-100 rounded-md"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 pt-4 space-y-1">
          {menu.map((item) => {
            const active = pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                group cursor-pointer
                ${
                  active
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {/* Highlight bar */}
                {active && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 rounded-r-full"></span>
                )}

                {item.icon}

                {!collapsed && (
                  <span className="font-medium tracking-wide">
                    {item.label}
                  </span>
                )}

                {/* Right arrow when active */}
                {!collapsed && active && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER Branding */}
        {!collapsed && (
          <div className="text-center text-xs text-slate-500 py-3 border-t">
            © {new Date().getFullYear()} Your Company
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
