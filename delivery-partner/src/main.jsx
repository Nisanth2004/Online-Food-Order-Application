import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { PartnerProvider } from "./context/PartnerContext";
import "./styles.css";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PartnerProvider>
        <App />
        <Toaster position="top-right" />
      </PartnerProvider>
    </BrowserRouter>
  </React.StrictMode>
);
