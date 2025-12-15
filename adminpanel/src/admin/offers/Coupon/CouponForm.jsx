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
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    discountPercent: "",
    minOrderAmount: "",
    expiryDate: "",
    active: true
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // ✅ Load coupon in edit mode
  useEffect(() => {
    if (id) loadCoupon();
  }, [id]);

  const loadCoupon = async () => {
    try {
      const res = await getCouponById(id);
      setForm(res.data);
      setPreview(res.data.imageUrl);
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

  const onImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(form)], { type: "application/json" })
      );

      if (image) {
        formData.append("image", image);
      }

      if (id) {
        await updateCoupon(id, formData);
        toast.success("Coupon updated");
      } else {
        await createCoupon(formData);
        toast.success("Coupon created");
      }

      navigate("/admin/offers/coupons");
    } catch {
      toast.error("Failed to save coupon");
    }
  };

  return (
    <div className="container py-4">
      <BackHeader title={id ? "Edit Coupon" : "Create Coupon"} backTo="/admin/offers/coupons" />

      <form onSubmit={submit} className="card p-4 col-md-6">
        <input
          className="form-control mb-3"
          name="code"
          placeholder="Coupon Code"
          value={form.code}
          onChange={onChange}
          required
        />

        <input
          type="number"
          className="form-control mb-3"
          name="discountPercent"
          placeholder="Discount %"
          value={form.discountPercent}
          onChange={onChange}
          required
        />

        <input
          type="number"
          className="form-control mb-3"
          name="minOrderAmount"
          placeholder="Min Order Amount"
          value={form.minOrderAmount}
          onChange={onChange}
          required
        />

        <input
          type="datetime-local"
          className="form-control mb-3"
          name="expiryDate"
          value={form.expiryDate || ""}
          onChange={onChange}
          required
        />

        {/* ✅ IMAGE UPLOAD */}
        <div className="mb-3">
          <label className="form-label">Coupon Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={onImageChange}
          />
        </div>

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="img-fluid rounded mb-3"
            style={{ maxHeight: "180px" }}
          />
        )}

        측
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
