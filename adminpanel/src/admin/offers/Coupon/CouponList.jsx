import React, { useEffect, useState } from "react";
import { getCoupons, deleteCoupon } from "../../../services/CouponService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BackHeader from "../../../components/BackHeader";
const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const navigate = useNavigate();

  const loadCoupons = async () => {
    try {
      const res = await getCoupons();
      setCoupons(res.data);
    } catch {
      toast.error("Failed to load coupons");
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete coupon?")) return;
    await deleteCoupon(id);
    toast.success("Coupon deleted");
    loadCoupons();
  };

  return (
    <div className="container py-4">
         <BackHeader title="Coupons" />
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
     
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin/offers/coupons/new")}
        >
          + New Coupon
        </button>
      </div>

      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th>Code</th>
            <th>Discount</th>
            <th>Min Order</th>
            <th>Expiry</th>
            <th>Status</th>
            <th style={{ width: "160px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No coupons found
              </td>
            </tr>
          ) : (
            coupons.map(c => (
              <tr key={c.id}>
                <td><strong>{c.code}</strong></td>
                <td>{c.discountPercent}%</td>
                <td>₹{c.minOrderAmount}</td>
                <td>{new Date(c.expiryDate).toLocaleString()}</td>
                <td>
                  <span
                    className={`badge ${
                      c.active ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() =>
                      navigate(`/admin/offers/coupons/edit/${c.id}`)
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => remove(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CouponList;
