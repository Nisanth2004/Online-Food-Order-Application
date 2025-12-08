import React from "react";
import { Routes, Route } from "react-router-dom";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Settings from "./pages/Settings";
import Layout from "./Layout/Layout";
import Earnings from "./components/Earnings";
import HubOrders from "./pages/HubOrders";
import HubOrderDetails from "./pages/HubOrderDetails";


export default function App() {
  return (
    <Routes>
      <Route
        path="/orders"
        element={
          <Layout>
            <Orders />
          </Layout>
        }
      />
      
      <Route
        path="/order/:id"
        element={
          <Layout>
            <OrderDetails />
          </Layout>
        }
      />
      <Route
        path="/"
        element={
          <Layout>
            <Settings />
          </Layout>
        }
      />
         <Route
        path="/settings"
        element={
          <Layout>
            <Settings />
          </Layout>
        }
      />

      <Route path="/earnings" element={<Layout><Earnings/></Layout>} />


<Route path="/hub-orders" element={<Layout><HubOrders /></Layout>} />
<Route path="/hub/order/:id" element={<Layout><HubOrderDetails /></Layout>} />

    </Routes>
  );
}
