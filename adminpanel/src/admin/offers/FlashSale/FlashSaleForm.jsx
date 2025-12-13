import { useEffect, useState } from "react";
import { getFoodList } from "../../../services/FoodService";
import { createFlashSale } from "../../../services/FlashSaleService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BackHeader from "../../../components/BackHeader";
const FlashSaleForm = () => {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState({
    foodId: "",
    salePrice: "",
    startTime: "",
    endTime: "",
    active: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    getFoodList(0, 100).then(res => setFoods(res.foods));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await createFlashSale(form);
    toast.success("Flash sale created");
    navigate("/admin/offers/flash-sales");
  };

  const timeLeft = () => {
    if (!form.endTime) return "";
    const diff = new Date(form.endTime) - new Date();
    if (diff <= 0) return "Expired";
    const mins = Math.floor(diff / 60000);
    return `${mins} minutes left`;
  };

  return (
    <div className="container py-4">
   <BackHeader title="Create Flash Sale" backTo="/admin/offers/flash-sales" />


      <form onSubmit={submit}>
        <select
          className="form-control mb-3"
          onChange={e => setForm({ ...form, foodId: e.target.value })}
          required
        >
          <option value="">Select Food</option>
          {foods.map(f => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="form-control mb-3"
          placeholder="Sale Price"
          onChange={e => setForm({ ...form, salePrice: e.target.value })}
          required
        />

        <label>Start Time</label>
        <input
          type="datetime-local"
          className="form-control mb-3"
          onChange={e => setForm({ ...form, startTime: e.target.value })}
        />

        <label>End Time</label>
        <input
          type="datetime-local"
          className="form-control mb-2"
          onChange={e => setForm({ ...form, endTime: e.target.value })}
        />

        {form.endTime && (
          <div className="alert alert-warning">
            ⏱ {timeLeft()}
          </div>
        )}

        <button className="btn btn-danger">Create Flash Sale</button>
      </form>
    </div>
  );
};

export default FlashSaleForm;
