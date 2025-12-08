import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import { PartnerProvider } from "./context/PartnerContext";
import { GpsProvider } from "./context/GpsContext";   // ✅ ADD THIS

import { Toaster } from "react-hot-toast";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>

      {/* ✅ Wrap everything with GpsProvider */}
      <GpsProvider>              
        <PartnerProvider>
          <App />
          <Toaster position="top-center" />
        </PartnerProvider>
      </GpsProvider>

    </BrowserRouter>
  </React.StrictMode>
);
