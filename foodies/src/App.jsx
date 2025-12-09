import React, { useContext } from "react";
import Menubar from "./components/Menubar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./Pages/Home/Home";
import ContactUs from "./Pages/Contact/Contact";
import ExploreFood from "./Pages/ExploreFood/ExploreFood";
import FoodDetails from "./Pages/FoodDetails/FoodDetails";
import Cart from "./Pages/Cart/Cart";
import PlaceOrder from "./Pages/PlaceOrder/PlaceOrder";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer } from "react-toastify";
import MyOrders from "./Pages/MyOrders/MyOrders";
import { StoreContext } from "./Context/StoreContext";
import Footer from "./components/Footer/Footer";
import WishList from "./components/WishList/WishList";
import OrderTracking from "./Pages/OrderTracking/OrderTracking";
import ScrollToTop from "./ScrollToTop/ScrollToTop";


const App = () => {
  const { token } = useContext(StoreContext);
  const location = useLocation();

  // Hide Menubar & Footer on login/register
  const hideLayout = ["/login", "/register"].includes(location.pathname);

  return (
    <div>
      {!hideLayout && <Menubar />}
      <ScrollToTop/>
      <ToastContainer />

      {/* No PageTransition here */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/explore" element={<ExploreFood />} />
        <Route path="/food/:id" element={<FoodDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={token ? <PlaceOrder /> : <Login />} />
        <Route path="/login" element={token ? <Home /> : <Login />} />
        <Route path="/register" element={token ? <Home /> : <Register />} />
        <Route path="/myorders" element={token ? <MyOrders /> : <Login />} />
        <Route path="/wishlist" element={token ? <WishList /> : <Login />} />
         <Route path="/orders/track/:id" element={token ? <OrderTracking /> : <Login />} />
      </Routes>

      {!hideLayout && <Footer />}
    </div>
  );
};

export default App;
