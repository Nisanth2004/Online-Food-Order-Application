import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { PartnerProvider } from "./context/PartnerContext";

import { Toaster } from "react-hot-toast";
import "./index.css";


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PartnerProvider>
        <App />
        <Toaster position="top-center" />
      </PartnerProvider>
    </BrowserRouter>
  </React.StrictMode>
);
