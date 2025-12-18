import React, { useEffect, useState, useMemo } from "react";
import {
  createPromotion,
  getPromotionById,
  updatePromotion
} from "../../../services/PromotionService";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import BackHeader from "../../../components/BackHeader";

const PromotionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    type: "FESTIVAL",
    startTime: "",
    endTime: "",
    active: true
  });

  const [errors, setErrors] = useState({});

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  /* ---------------- LOAD PROMOTION ---------------- */
  useEffect(() => {
    if (id) loadPromotion();
  }, [id]);

  const loadPromotion = async () => {
    const res = await getPromotionById(id);
    setForm(res.data);
    setPreview(res.data.bannerImage);
  };

  /* ---------------- CHANGE HANDLER ---------------- */
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
    if (file) setPreview(URL.createObjectURL(file));
  };

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    } else if (form.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!form.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!form.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (form.startTime && form.endTime) {
      if (new Date(form.endTime) <= new Date(form.startTime)) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- FORM VALID STATE ---------------- */
  const isFormValid = useMemo(() => {
    return (
      form.title &&
      form.startTime &&
      form.endTime &&
      Object.keys(errors).length === 0
    );
  }, [form, errors]);

  /* ---------------- SUBMIT ---------------- */
  const submit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(form)], {
        type: "application/json"
      })
    );

    if (image) {
      formData.append("image", image);
    }

    try {
      if (id) {
        await updatePromotion(id, formData);
        toast.success("Promotion updated");
      } else {
        await createPromotion(formData);
        toast.success("Promotion created");
      }
      navigate("/admin/offers/promotions");
    } catch {
      toast.error("Failed to save promotion");
    }
  };

  return (
    <div className="container py-4">
      <BackHeader
        title={id ? "Edit Promotion" : "Create Promotion"}
        backTo="/admin/offers/promotions"
      />

      <form onSubmit={submit} className="card p-4 col-md-6">
        {/* TITLE */}
        <input
          className="form-control mb-1"
          placeholder="Title"
          name="title"
          value={form.title}
          onChange={onChange}
        />
        {errors.title && (
          <div className="text-danger mb-2">{errors.title}</div>
        )}

        {/* IMAGE */}
        <input
          type="file"
          className="form-control mb-3"
          accept="image/*"
          onChange={onImageChange}
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mb-3 rounded"
            style={{ width: "100%", maxHeight: 200, objectFit: "cover" }}
          />
        )}

        {/* TYPE */}
        <select
          className="form-control mb-3"
          name="type"
          value={form.type}
          onChange={onChange}
        >
          <option value="FESTIVAL">Festival</option>
          <option value="FLASH">Flash</option>
          <option value="COMBO">Combo</option>
        </select>

        {/* START TIME */}
        <input
          type="datetime-local"
          className="form-control mb-1"
          name="startTime"
          value={form.startTime || ""}
          onChange={onChange}
        />
        {errors.startTime && (
          <div className="text-danger mb-2">{errors.startTime}</div>
        )}

        {/* END TIME */}
        <input
          type="datetime-local"
          className="form-control mb-1"
          name="endTime"
          value={form.endTime || ""}
          onChange={onChange}
        />
        {errors.endTime && (
          <div className="text-danger mb-2">{errors.endTime}</div>
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
          className="btn btn-primary"
          disabled={!isFormValid}
        >
          {id ? "Update Promotion" : "Save Promotion"}
        </button>
      </form>
    </div>
  );
};

export default PromotionForm;
