import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <div>
      <nav className="topbar">
        <div className="container nav-inner">
          <Link to="/" className="brand">Delivery Partner</Link>
          <div>
            <Link to="/" className="navlink">Orders</Link>
            <Link to="/settings" className="navlink">Settings</Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}
