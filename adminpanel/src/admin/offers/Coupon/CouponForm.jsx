import React, { useEffect, useState, useMemo } from "react";
import {
  createCoupon,
  getCouponById,
  updateCoupon,
  
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

  const [errors, setErrors] = useState({});
  const [codeExists, setCodeExists] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  /* ---------------- LOAD COUPON ---------------- */
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

  /* ---------------- CHANGE HANDLER ---------------- */
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm(prev => ({
      ...prev,
      [name]:
        name === "code"
          ? value.toUpperCase() // ✅ auto uppercase
          : type === "checkbox"
          ? checked
          : value
    }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  /* ---------------- DUPLICATE CODE CHECK ---------------- */
  const checkDuplicateCode = async () => {
    if (!form.code || form.code.length < 3) return;

    try {
      setCheckingCode(true);
      const res = await checkCouponCode(form.code, id); // backend ignores same ID
      setCodeExists(res.exists);
    } catch {
      toast.error("Failed to check coupon code");
    } finally {
      setCheckingCode(false);
    }
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {};
    const now = new Date();

    if (!form.code.trim()) {
      newErrors.code = "Coupon code is required";
    } else if (form.code.length < 3) {
      newErrors.code = "Coupon code must be at least 3 characters";
    }

    if (!form.discountPercent) {
      newErrors.discountPercent = "Discount percent is required";
    } else if (
      Number(form.discountPercent) <= 0 ||
      Number(form.discountPercent) > 100
    ) {
      newErrors.discountPercent = "Discount must be between 1 and 100";
    }

    if (!form.minOrderAmount) {
      newErrors.minOrderAmount = "Minimum order amount is required";
    } else if (Number(form.minOrderAmount) < 0) {
      newErrors.minOrderAmount = "Amount cannot be negative";
    }

    if (!form.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (new Date(form.expiryDate) <= now) {
      newErrors.expiryDate = "Expiry date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- FORM VALID STATE ---------------- */
  const isFormValid = useMemo(() => {
    return (
      validate &&
      Object.keys(errors).length === 0 &&
      !codeExists &&
      !checkingCode
    );
  }, [errors, codeExists, checkingCode]);

  /* ---------------- SUBMIT ---------------- */
  const submit = async (e) => {
    e.preventDefault();

    if (!validate() || codeExists) return;

    try {
      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(form)], { type: "application/json" })
      );

      if (image) formData.append("image", image);

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
      <BackHeader
        title={id ? "Edit Coupon" : "Create Coupon"}
        backTo="/admin/offers/coupons"
      />

      <form onSubmit={submit} className="card p-4 col-md-6">
        {/* CODE */}
        <input
          className="form-control mb-1"
          name="code"
          placeholder="Coupon Code"
          value={form.code}
          onChange={onChange}
          onBlur={checkDuplicateCode}
        />
        {checkingCode && (
          <div className="text-muted mb-1">Checking code...</div>
        )}
        {errors.code && <div className="text-danger">{errors.code}</div>}
        {codeExists && (
          <div className="text-danger mb-2">
            Coupon code already exists
          </div>
        )}

        {/* DISCOUNT */}
        <input
          type="number"
          className="form-control mb-1"
          name="discountPercent"
          placeholder="Discount %"
          value={form.discountPercent}
          onChange={onChange}
        />
        {errors.discountPercent && (
          <div className="text-danger mb-2">{errors.discountPercent}</div>
        )}

        {/* MIN ORDER */}
        <input
          type="number"
          className="form-control mb-1"
          name="minOrderAmount"
          placeholder="Min Order Amount"
          value={form.minOrderAmount}
          onChange={onChange}
        />
        {errors.minOrderAmount && (
          <div className="text-danger mb-2">{errors.minOrderAmount}</div>
        )}

        {/* EXPIRY */}
        <input
          type="datetime-local"
          className="form-control mb-1"
          name="expiryDate"
          value={form.expiryDate || ""}
          onChange={onChange}
        />
        {errors.expiryDate && (
          <div className="text-danger mb-2">{errors.expiryDate}</div>
        )}

        {/* IMAGE */}
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

        {/* ACTIVE */}
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

        <button
          className="btn btn-success"
          disabled={!isFormValid}
        >
          {id ? "Update Coupon" : "Save Coupon"}
        </button>
      </form>
    </div>
  );
};

export default CouponForm;
