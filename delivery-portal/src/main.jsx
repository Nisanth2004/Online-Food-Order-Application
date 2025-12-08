import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import DeliveryProvider from "./context/DeliveryContext";
import HubProvider from "./context/HubContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HubProvider>
      <DeliveryProvider>
        <App />
      </DeliveryProvider>
    </HubProvider>
  </React.StrictMode>
);
