import { BrowserRouter, Routes, Route } from "react-router-dom";
import HubLogin from "./auth/HubLogin";
import DeliveryLogin from "./auth/DeliveryLogin";
import HubDashboard from "./hub/HubDashboard";
import DeliveryDashboard from "./delivery/DeliveryDashboard";
import HubOrderDetails from "./hub/HubOrderDetails";
import DeliveryOrderDetails from "./delivery/DeliveryOrderDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Pages */}
        <Route path="/hub/login" element={<HubLogin />} />
        <Route path="/delivery/login" element={<DeliveryLogin />} />

        {/* Dashboards */}
        <Route path="/hub/dashboard" element={<HubDashboard />} />
        <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

        {/* Order Pages */}
        <Route path="/hub/order/:id" element={<HubOrderDetails />} />
        <Route path="/delivery/order/:id" element={<DeliveryOrderDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
