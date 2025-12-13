import React, { useEffect, useState } from "react";
import {
  createCoupon,
  getCouponById,
  updateCoupon
} from "../../../services/CouponService";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import BackHeader from "../../../components/BackHeader";
const CouponForm = () => {
  const { id } = useParams(); // 👈 edit mode if exists
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    discountPercent: "",
    minOrderAmount: "",
    expiryDate: "",
    active: true
  });

  // ✅ Load coupon for edit
  useEffect(() => {
    if (id) loadCoupon();
  }, [id]);

  const loadCoupon = async () => {
    try {
      const res = await getCouponById(id);
      setForm(res.data);
    } catch {
      toast.error("Failed to load coupon");
    }
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateCoupon(id, form);
        toast.success("Coupon updated");
      } else {
        await createCoupon(form);
        toast.success("Coupon created");
      }
      navigate("/admin/offers/coupons");
    } catch {
      toast.error("Failed to save coupon");
    }
  };

  return (
    <div className="container py-4">
        <BackHeader title="Create Coupon" backTo="/admin/offers/coupons" />

      <h3>{id ? "Edit Coupon" : "Create Coupon"}</h3>

      <form onSubmit={submit} className="card p-4 col-md-6">
        <div className="mb-3">
          <label className="form-label">Coupon Code</label>
          <input
            className="form-control"
            name="code"
            value={form.code}
            onChange={onChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Discount %</label>
          <input
            type="number"
            className="form-control"
            name="discountPercent"
            value={form.discountPercent}
            onChange={onChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Minimum Order Amount</label>
          <input
            type="number"
            className="form-control"
            name="minOrderAmount"
            value={form.minOrderAmount}
            onChange={onChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Expiry Date</label>
          <input
            type="datetime-local"
            className="form-control"
            name="expiryDate"
            value={form.expiryDate || ""}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            name="active"
            checked={form.active}
            onChange={onChange}
          />
          <label className="form-check-label">Active</label>
        </div>

        <button className="btn btn-success">
          {id ? "Update Coupon" : "Save Coupon"}
        </button>
      </form>
    </div>
  );
};

export default CouponForm;
