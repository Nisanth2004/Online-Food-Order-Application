import { Routes, Route, Navigate } from "react-router-dom";
import { AdminFoodProvider } from "./context/AdminFoodContext";

// Admin




import PrivateRoute from "./PrivateRoute/PrivateRoute";
import AdminLayout from "./AdminLayout/AdminLayout";
import Login from "./components/auth/Login";

import VendorDashboard from "./pages/VendorDashboard";
import VendorLogin from "./components/auth/VendorLogin";
import VendorRegister from "./components/auth/VendorRegister";
import VendorProtectedRoute from "./components/auth/VendorProtectedRoute";
import VendorDetails from "./components/Vendors/VendorDetails";

const App = () => {
  return (
    <AdminFoodProvider>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/admin/login" element={<Login />} />
      

        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/vendor/login" element={<VendorLogin />} />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        />

        {/* ================= VENDOR ================= */}
        <Route
          path="/vendor/dashboard"
          element={
            <VendorProtectedRoute>
              <VendorDashboard />
            </VendorProtectedRoute>
          }
        />

        <Route path="/admin/vendors/:vendorId" element={<VendorDetails />} />


        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/admin/login" />} />

      </Routes>
    </AdminFoodProvider>
  );
};

export default App;
