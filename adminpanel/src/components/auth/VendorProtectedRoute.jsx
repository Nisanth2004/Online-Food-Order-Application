import { Navigate } from "react-router-dom";

const VendorProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "VENDOR") {
    return <Navigate to="/vendor/login" replace />;
  }

  return children;
};

export default VendorProtectedRoute;
