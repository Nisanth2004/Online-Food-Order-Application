import React, { useState } from "react";
import { createCoupon } from "../../../services/CouponService";
import { toast } from "react-toastify";
import BackHeader from "../../../components/BackHeader";
const CouponForm = () => {
  const [form, setForm] = useState({
    code: "",
    discountPercent: "",
    minOrderAmount: "",
    expiryDate: "",
    active: true
  });

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
      await createCoupon(form);
      toast.success("Coupon created");
      setForm({
        code: "",
        discountPercent: "",
        minOrderAmount: "",
        expiryDate: "",
        active: true
      });
    } catch {
      toast.error("Failed to create coupon");
    }
  };

  return (
    <div className="container py-4">
   <BackHeader title="Create Combo" backTo="/admin/offers/combos" />


      <form onSubmit={submit} className="card p-4 col-md-6">
        <input className="form-control mb-3" name="code" placeholder="Coupon Code" onChange={onChange} required />
        <input type="number" className="form-control mb-3" name="discountPercent" placeholder="Discount %" onChange={onChange} required />
        <input type="number" className="form-control mb-3" name="minOrderAmount" placeholder="Min Order Amount" onChange={onChange} required />
        <input type="datetime-local" className="form-control mb-3" name="expiryDate" onChange={onChange} required />

        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" name="active" checked={form.active} onChange={onChange} />
          <label className="form-check-label">Active</label>
        </div>

        <button className="btn btn-success">Save Coupon</button>
      </form>
    </div>
  );
};

export default CouponForm;
