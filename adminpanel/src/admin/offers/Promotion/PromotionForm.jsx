import React, { useEffect, useState } from "react";
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

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (id) loadPromotion();
  }, [id]);

  const loadPromotion = async () => {
    const res = await getPromotionById(id);
    setForm(res.data);
    setPreview(res.data.bannerImage);
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

    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(form)], {
      type: "application/json"
    }));

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
      <BackHeader title={id ? "Edit Promotion" : "Create Promotion"} backTo="/admin/offers/promotions" />


      <form onSubmit={submit} className="card p-4 col-md-6">

        <input
          className="form-control mb-3"
          placeholder="Title"
          name="title"
          value={form.title}
          onChange={onChange}
          required
        />

        {/* IMAGE UPLOAD */}
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

        <input
          type="datetime-local"
          className="form-control mb-3"
          name="startTime"
          value={form.startTime || ""}
          onChange={onChange}
        />

        <input
          type="datetime-local"
          className="form-control mb-3"
          name="endTime"
          value={form.endTime || ""}
          onChange={onChange}
        />

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

        <button className="btn btn-primary">
          {id ? "Update Promotion" : "Save Promotion"}
        </button>
      </form>
    </div>
  );
};

export default PromotionForm;
