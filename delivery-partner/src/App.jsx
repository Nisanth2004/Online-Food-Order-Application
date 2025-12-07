import React from "react";
import { Routes, Route } from "react-router-dom";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Settings from "./pages/Settings";
import Layout from "./Layout/Layout";


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
    </Routes>
  );
}
