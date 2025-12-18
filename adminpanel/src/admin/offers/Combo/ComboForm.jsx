import { useEffect, useState, useMemo } from "react";
import { getFoodList } from "../../../services/FoodService";
import {
  createCombo,
  getComboById,
  updateCombo
} from "../../../services/ComboService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import BackHeader from "../../../components/BackHeader";

const ComboForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [foods, setFoods] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    foodIds: [],
    comboPrice: "",
    active: true,
    startTime: "",
    endTime: ""
  });

  useEffect(() => {
    loadFoods();
    if (id) loadCombo();
  }, []);

  const loadFoods = async () => {
    const res = await getFoodList(0, 100);
    setFoods(res.foods || []);
  };

  const loadCombo = async () => {
    const res = await getComboById(id);
    setForm(res.data);
    if (res.data.imageUrl) setPreview(res.data.imageUrl);
  };

  const toggleFood = (foodId) => {
    setForm((prev) => ({
      ...prev,
      foodIds: prev.foodIds.includes(foodId)
        ? prev.foodIds.filter((id) => id !== foodId)
        : [...prev.foodIds, foodId]
    }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  /* 🔵 TOTAL FOOD PRICE */
  const totalFoodPrice = useMemo(() => {
    return foods
      .filter((f) => form.foodIds.includes(f.id))
      .reduce((sum, f) => sum + (f.sellingPrice || 0), 0);
  }, [foods, form.foodIds]);

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Combo name is required";
    }

    if (form.foodIds.length === 0) {
      newErrors.foodIds = "Select at least one food item";
    }

    if (!form.comboPrice) {
      newErrors.comboPrice = "Combo price is required";
    } else if (Number(form.comboPrice) <= 0) {
      newErrors.comboPrice = "Combo price must be greater than 0";
    } else if (
      totalFoodPrice > 0 &&
      Number(form.comboPrice) >= totalFoodPrice
    ) {
      newErrors.comboPrice =
        "Combo price must be less than total food price";
    }

    if (!form.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!form.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (
      form.startTime &&
      form.endTime &&
      new Date(form.endTime) <= new Date(form.startTime)
    ) {
      newErrors.endTime = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(form)], { type: "application/json" })
      );

      if (image) formData.append("image", image);

      if (id) {
        await updateCombo(id, formData);
        toast.success("Combo updated");
      } else {
        await createCombo(formData);
        toast.success("Combo created");
      }

      navigate("/admin/offers/combos");
    } catch {
      toast.error("Failed to save combo");
    }
  };

  return (
    <div className="container py-4">
      <BackHeader
        title={id ? "Edit Combo" : "Create Combo"}
        backTo="/admin/offers/combos"
      />

      <form onSubmit={submit} className="card p-4">
        {/* COMBO NAME */}
        <input
          className="form-control mb-1"
          placeholder="Combo Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && (
          <div className="text-danger mb-2">{errors.name}</div>
        )}

        {/* IMAGE */}
        <div className="mb-3">
          <label className="form-label">Combo Image</label>
          <input type="file" className="form-control" onChange={onImageChange} />
        </div>

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="img-fluid rounded mb-3"
            style={{ maxHeight: 180 }}
          />
        )}

        {/* FOOD TABLE */}
        <h5 className="mt-3 mb-2">Select Foods</h5>
        {errors.foodIds && (
          <div className="text-danger mb-2">{errors.foodIds}</div>
        )}

        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Select</th>
                <th>Name</th>
                <th>Price (₹)</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((f) => (
                <tr key={f.id}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={form.foodIds.includes(f.id)}
                      onChange={() => toggleFood(f.id)}
                      disabled={f.stock === 0}
                    />
                  </td>
                  <td>{f.name}</td>
                  <td>₹{f.sellingPrice}</td>
                  <td>
                    {f.stock === 0 ? (
                      <span className="badge bg-danger">Out</span>
                    ) : (
                      <span className="badge bg-success">{f.stock}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL PRICE */}
        <div className="alert alert-info mt-3">
          <div className="fw-semibold">
            Total Selected Food Price: ₹{totalFoodPrice.toFixed(2)}
          </div>
          <div className="small text-muted mt-1">
            Reference total shown to help admin set the final combo price
          </div>
        </div>

        {/* COMBO PRICE */}
        <input
          type="number"
          className="form-control mt-1"
          placeholder="Final Combo Price"
          value={form.comboPrice}
          onChange={(e) =>
            setForm({ ...form, comboPrice: e.target.value })
          }
        />
        {errors.comboPrice && (
          <div className="text-danger mb-2">{errors.comboPrice}</div>
        )}

        {/* TIME */}
        <div className="row mt-3">
          <div className="col">
            <label>Start Time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
              }
            />
            {errors.startTime && (
              <div className="text-danger mt-1">
                {errors.startTime}
              </div>
            )}
          </div>

          <div className="col">
            <label>End Time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={form.endTime}
              onChange={(e) =>
                setForm({ ...form, endTime: e.target.value })
              }
            />
            {errors.endTime && (
              <div className="text-danger mt-1">
                {errors.endTime}
              </div>
            )}
          </div>
        </div>

        {/* ACTIVE */}
        <div className="form-check mt-3">
          <input
            type="checkbox"
            className="form-check-input"
            checked={form.active}
            onChange={(e) =>
              setForm({ ...form, active: e.target.checked })
            }
          />
          <label className="form-check-label ms-2">Active</label>
        </div>

        <button className="btn btn-success mt-4 w-100">
          Save Combo
        </button>
      </form>
    </div>
  );
};

export default ComboForm;
