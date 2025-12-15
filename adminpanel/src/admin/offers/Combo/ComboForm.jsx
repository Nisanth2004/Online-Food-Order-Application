import { useEffect, useState } from "react";
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
    setFoods(res.foods);
  };

  const loadCombo = async () => {
    const res = await getComboById(id);
    setForm(res.data);

    // show existing image if present
    if (res.data.imageUrl) {
      setPreview(res.data.imageUrl);
    }
  };

  const toggleFood = (foodId) => {
    setForm(prev => ({
      ...prev,
      foodIds: prev.foodIds.includes(foodId)
        ? prev.foodIds.filter(id => id !== foodId)
        : [...prev.foodIds, foodId]
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
        await updateCombo(id, formData);
        toast.success("Combo updated");
      } else {
        await createCombo(formData);
        toast.success("Combo created");
      }

      navigate("/admin/offers/combos");
    } catch (err) {
      toast.error("Failed to save combo");
    }
  };

  return (
    <div className="container py-4">
      <BackHeader
        title={id ? "Edit Combo" : "Create Combo"}
        backTo="/admin/offers/combos"
      />

      <form onSubmit={submit} className="card p-4 col-md-7">
        <input
          className="form-control mb-3"
          placeholder="Combo Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />

        {/* IMAGE */}
        <div className="mb-3">
          <label className="form-label">Combo Image</label>
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
            alt="Preview"
            className="img-fluid rounded mb-3"
            style={{ maxHeight: "180px" }}
          />
        )}

        <h6>Select Foods</h6>
        {foods.map(f => (
          <div key={f.id} className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={form.foodIds.includes(f.id)}
              onChange={() => toggleFood(f.id)}
            />
            <label className="form-check-label ms-2">
              {f.name} – ₹{f.sellingPrice}
            </label>
          </div>
        ))}

        <input
          type="number"
          className="form-control mt-3"
          placeholder="Combo Price"
          value={form.comboPrice}
          onChange={e => setForm({ ...form, comboPrice: e.target.value })}
          required
        />

        <div className="row mt-3">
          <div className="col">
            <label>Start Time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={form.startTime}
              onChange={e => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div className="col">
            <label>End Time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={form.endTime}
              onChange={e => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </div>

        <div className="form-check mt-3">
          <input
            type="checkbox"
            className="form-check-input"
            checked={form.active}
            onChange={e => setForm({ ...form, active: e.target.checked })}
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
