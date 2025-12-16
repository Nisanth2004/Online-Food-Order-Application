import { useEffect, useState, useMemo } from "react";
import { getFoodList } from "../../../services/FoodService";
import { createFlashSale } from "../../../services/FlashSaleService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BackHeader from "../../../components/BackHeader";

const FlashSaleForm = () => {
  const [foods, setFoods] = useState([]);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    foodId: "",
    salePrice: "",
    startTime: "",
    endTime: "",
    active: true
  });

  useEffect(() => {
    getFoodList(0, 100).then(res => setFoods(res.foods));
  }, []);

  const selectedFood = useMemo(
    () => foods.find(f => f.id === form.foodId),
    [foods, form.foodId]
  );

  const submit = async (e) => {
    e.preventDefault();
    await createFlashSale(form);
    toast.success("Flash sale created");
    navigate("/admin/offers/flash-sales");
  };

  const timeLeft = () => {
  if (!form.endTime) return "";
  const diff = new Date(form.endTime) - new Date();

  if (diff <= 0) return "Flash sale expired";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  if (hours > 0) {
    return `${hours} hr ${minutes} min remaining`;
  }
  return `${minutes} minutes remaining`;
};


  const formatDateTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};


  return (
    <div className="container py-4">
      <BackHeader
        title="Create Flash Sale"
        backTo="/admin/offers/flash-sales"
      />

      <form onSubmit={submit} className="card p-4">

        {/* FOOD TABLE */}
        <h6 className="mb-2">Select Food Item</h6>
        <div className="table-responsive mb-3">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th />
                <th>Food</th>
                <th>Stock</th>
                <th>Original Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {foods.map(f => (
                <tr key={f.id}>
                  <td>
                    <input
                      type="radio"
                      name="foodSelect"
                      checked={form.foodId === f.id}
                      onChange={() =>
                        setForm({ ...form, foodId: f.id })
                      }
                      required
                    />
                  </td>
                  <td>{f.name}</td>
                  <td>
                    {f.stock <= 0 ? (
                      <span className="badge bg-danger">Out</span>
                    ) : (
                      f.stock
                    )}
                  </td>
                  <td>₹{f.sellingPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* REFERENCE PRICE */}
        {selectedFood && (
          <div className="alert alert-info">
            <div className="fw-semibold">
              Original Food Price: ₹{selectedFood.sellingPrice}
            </div>
            <div className="small text-muted mt-1">
              Reference price shown to help admin set the flash sale price
            </div>
          </div>
        )}

        {/* SALE PRICE */}
        <input
          type="number"
          className="form-control mb-3"
          placeholder="Flash Sale Price"
          value={form.salePrice}
          onChange={e =>
            setForm({ ...form, salePrice: e.target.value })
          }
          required
        />

        {/* TIME */}
       <label>Start Time</label>
<input
  type="datetime-local"
  className="form-control mb-1"
  value={form.startTime}
  onChange={e =>
    setForm({ ...form, startTime: e.target.value })
  }
/>

{form.startTime && (
  <div className="small text-muted mb-3">
    📅 Starts on: <strong>{formatDateTime(form.startTime)}</strong>
  </div>
)}


       <label>End Time</label>
<input
  type="datetime-local"
  className="form-control mb-1"
  value={form.endTime}
  onChange={e =>
    setForm({ ...form, endTime: e.target.value })
  }
/>

{form.endTime && (
  <div className="small text-muted mb-2">
    ⏰ Ends on: <strong>{formatDateTime(form.endTime)}</strong>
  </div>
)}


        {form.endTime && (
          <div className="alert alert-warning py-2">
            ⏱ {timeLeft()}
          </div>
        )}

        <button className="btn btn-danger w-100">
          Create Flash Sale
        </button>
      </form>
    </div>
  );
};

export default FlashSaleForm;
