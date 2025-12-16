import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

/* ===== Pages ===== */
import AddFood from "./pages/AddFood/AddFood";
import ListFood from "./pages/ListFood/ListFood";
import Orders from "./pages/Orders/Orders";
import OrderDetails from "./pages/OrderDetails";
import Customers from "./pages/Customers/Customers";
import CourierManagement from "./pages/CourierManagement/CourierManagement";
import { AdminFoodProvider } from "./context/AdminFoodContext";

/* ===== Layout Components ===== */
import Sidebar from "./components/Sidebar/Sidebar";
import Menubar from "./components/Menubar/Menubar";

/* ===== Admin Components ===== */
import AdminReview from "./components/Reviews/AdminReview";
import AdminCancelRequests from "./components/CancelledOrders/AdminCancelRequests";
import AdminSettings from "./components/AdminSettings/AdminSettings";

/* ===== Stock ===== */
import StockManagement from "./components/StockManagement";
import EditFood from "./components/EditFood";
import StockDashboard from "./components/StockDashboard/StockDashboard";
import StockAnalytics from "./components/StockAnalytics/StockAnalytics";
import StockLogs from "./components/StockLogs/StockLogs";

/* ===== Offers (Admin) ===== */
import OffersDashboard from "./admin/offers/OffersDashboard";

/* Combos */
import ComboList from "./admin/offers/Combo/ComboList";
import ComboForm from "./admin/offers/Combo/ComboForm";

/* Promotions */
import PromotionList from "./admin/offers/Promotion/PromotionList";
import PromotionForm from "./admin/offers/Promotion/PromotionForm";

/* Flash Sales */
import FlashSaleList from "./admin/offers/FlashSale/FlashSaleList";
import FlashSaleForm from "./admin/offers/FlashSale/FlashSaleForm";

/* Coupons */
import CouponList from "./admin/offers/Coupon/CouponList";
import CouponForm from "./admin/offers/Coupon/CouponForm";


const App = () => {
  const [sidebarVisible, setSidebarVisisble] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisisble(!sidebarVisible);
  };

  return (
    <AdminFoodProvider>
      {/* 👆 Provider stays mounted across route changes */}

      <div className="d-flex" id="wrapper">
        {/* Sidebar */}
        <Sidebar sidebarVisible={sidebarVisible} />

        {/* Page content wrapper */}
        <div id="page-content-wrapper">
          <Menubar toggleSidebar={toggleSidebar} />

          <ToastContainer />

          <div className="container-fluid">
            <Routes>
              {/* Food */}
              <Route path="/" element={<ListFood />} />
              <Route path="/add" element={<AddFood />} />
              <Route path="/list" element={<ListFood />} />
              <Route path="/edit/:id" element={<EditFood />} />

              {/* Orders */}
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/admin-cancel-requests" element={<AdminCancelRequests />} />

              {/* Stock */}
              <Route path="/stock-management" element={<StockManagement />} />
              <Route path="/analytics" element={<StockAnalytics />} />
              <Route path="/logs" element={<StockLogs />} />
              <Route path="/admin/stock-dashboard" element={<StockDashboard />} />

              {/* Users */}
              <Route path="/customers" element={<Customers />} />
              <Route path="/courier" element={<CourierManagement />} />
              <Route path="/reviews" element={<AdminReview />} />

              {/* Settings */}
              <Route path="/admin/settings" element={<AdminSettings />} />

              {/* Offers */}
              <Route path="/admin/offers" element={<OffersDashboard />} />

              {/* Combos */}
              <Route path="/admin/offers/combos" element={<ComboList />} />
              <Route path="/admin/offers/combos/new" element={<ComboForm />} />
              <Route path="/admin/offers/combos/edit/:id" element={<ComboForm />} />

              {/* Promotions */}
              <Route path="/admin/offers/promotions" element={<PromotionList />} />
              <Route path="/admin/offers/promotions/new" element={<PromotionForm />} />
              <Route path="/admin/offers/promotions/edit/:id" element={<PromotionForm />} />

              {/* Flash Sales */}
              <Route path="/admin/offers/flash-sales" element={<FlashSaleList />} />
              <Route path="/admin/offers/flash-sales/new" element={<FlashSaleForm />} />
              <Route path="/admin/offers/flash-sales/edit/:id" element={<FlashSaleForm />} />

              {/* Coupons */}
              <Route path="/admin/offers/coupons" element={<CouponList />} />
              <Route path="/admin/offers/coupons/new" element={<CouponForm />} />
              <Route path="/admin/offers/coupons/edit/:id" element={<CouponForm />} />
            </Routes>
          </div>
        </div>
      </div>

    </AdminFoodProvider>
  );
};

export default App;

