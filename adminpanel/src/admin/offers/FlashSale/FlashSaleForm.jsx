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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    getFoodList(0, 100).then(res => setFoods(res.foods || []));
  }, []);

  const selectedFood = useMemo(
    () => foods.find(f => f.id === form.foodId),
    [foods, form.foodId]
  );

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {};

    if (!form.foodId) {
      newErrors.foodId = "Please select a food item";
    }

    if (!form.salePrice) {
      newErrors.salePrice = "Flash sale price is required";
    } else if (Number(form.salePrice) <= 0) {
      newErrors.salePrice = "Price must be greater than 0";
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
        {errors.foodId && (
          <div className="text-danger mb-2">{errors.foodId}</div>
        )}

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
          className="form-control mb-1"
          placeholder="Flash Sale Price"
          value={form.salePrice}
          onChange={e =>
            setForm({ ...form, salePrice: e.target.value })
          }
        />
        {errors.salePrice && (
          <div className="text-danger mb-2">{errors.salePrice}</div>
        )}

        {/* START TIME */}
        <label>Start Time</label>
        <input
          type="datetime-local"
          className="form-control mb-1"
          value={form.startTime}
          onChange={e =>
            setForm({ ...form, startTime: e.target.value })
          }
        />
        {errors.startTime && (
          <div className="text-danger mb-2">{errors.startTime}</div>
        )}

        {form.startTime && (
          <div className="small text-muted mb-3">
            📅 Starts on: <strong>{formatDateTime(form.startTime)}</strong>
          </div>
        )}

        {/* END TIME */}
        <label>End Time</label>
        <input
          type="datetime-local"
          className="form-control mb-1"
          value={form.endTime}
          onChange={e =>
            setForm({ ...form, endTime: e.target.value })
          }
        />
        {errors.endTime && (
          <div className="text-danger mb-2">{errors.endTime}</div>
        )}

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
