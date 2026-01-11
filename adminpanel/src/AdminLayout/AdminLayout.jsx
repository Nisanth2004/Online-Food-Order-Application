import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";



import AddFood from "../pages/AddFood/AddFood";
import ListFood from "../pages/ListFood/ListFood";
import Orders from "../pages/Orders/Orders";
import OrderDetails from "../pages/OrderDetails";
import Customers from "../pages/Customers/Customers";
import CourierManagement from "../pages/CourierManagement/CourierManagement";
import AdminReview from "../components/Reviews/AdminReview";
import AdminCancelRequests from "../components/CancelledOrders/AdminCancelRequests";
import AdminSettings from "../components/AdminSettings/AdminSettings";


import StockDashboard from "../components/StockDashboard/StockDashboard";
import StockAnalytics from "../components/StockAnalytics/StockAnalytics";
import StockLogs from "../components/StockLogs/StockLogs";

import OffersDashboard from "../admin/offers/OffersDashboard";
import ComboList from "../admin/offers/Combo/ComboList";
import ComboForm from "../admin/offers/Combo/ComboForm";
import PromotionList from "../admin/offers/Promotion/PromotionList";
import PromotionForm from "../admin/offers/Promotion/PromotionForm";
import FlashSaleList from "../admin/offers/FlashSale/FlashSaleList";
import FlashSaleForm from "../admin/offers/FlashSale/FlashSaleForm";
import CouponList from "../admin/offers/Coupon/CouponList";
import CouponForm from "../admin/offers/Coupon/CouponForm";

import { useState } from "react";
import Sidebar from '../components/Sidebar/Sidebar';
import Menubar from '../components/Menubar/Menubar';
import VendorList from "../components/Vendors/VendorList";
import StockManagement from '../components/StockManagement/StockManagement';
import EditFood from "../components/EditFood/EditFood";

const AdminLayout = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar sidebarVisible={sidebarVisible} />

      <div id="page-content-wrapper">
        <Menubar toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
        <ToastContainer />

        <div className="container-fluid">
          <Routes>
            {/* Food */}
            <Route path="/" element={<ListFood />} />
            <Route path="add" element={<AddFood />} />
            <Route path="list" element={<ListFood />} />
            <Route path="edit/:id" element={<EditFood />} />

            {/* Orders */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="admin-cancel-requests" element={<AdminCancelRequests />} />

            {/* Stock */}
            <Route path="stock-management" element={<StockManagement />} />
            <Route path="analytics" element={<StockAnalytics />} />
            <Route path="logs" element={<StockLogs />} />
            <Route path="stock-dashboard" element={<StockDashboard />} />

            {/* Users */}
            <Route path="customers" element={<Customers />} />
            <Route path="courier" element={<CourierManagement />} />
            <Route path="reviews" element={<AdminReview />} />

            {/* Settings */}
            <Route path="settings" element={<AdminSettings />} />

            {/* Offers */}
            <Route path="offers" element={<OffersDashboard />} />

            {/* Combos */}
            <Route path="offers/combos" element={<ComboList />} />
            <Route path="offers/combos/new" element={<ComboForm />} />
            <Route path="offers/combos/edit/:id" element={<ComboForm />} />

            {/* Promotions */}
            <Route path="offers/promotions" element={<PromotionList />} />
            <Route path="offers/promotions/new" element={<PromotionForm />} />
            <Route path="offers/promotions/edit/:id" element={<PromotionForm />} />

            {/* Flash Sales */}
            <Route path="offers/flash-sales" element={<FlashSaleList />} />
            <Route path="offers/flash-sales/new" element={<FlashSaleForm />} />
            <Route path="offers/flash-sales/edit/:id" element={<FlashSaleForm />} />

            {/* Coupons */}
            <Route path="offers/coupons" element={<CouponList />} />
            <Route path="offers/coupons/new" element={<CouponForm />} />
            <Route path="offers/coupons/edit/:id" element={<CouponForm />} />

             {/* Vendors */}
             <Route path="vendors" element={<VendorList />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
