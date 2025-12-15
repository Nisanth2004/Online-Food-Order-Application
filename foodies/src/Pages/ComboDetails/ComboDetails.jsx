import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../service/CustomAxiosInstance";
import { StoreContext } from "../../Context/StoreContext";
import toast from "react-hot-toast";
import "./ComboDetails.css";

const ComboDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addComboToCart } = useContext(StoreContext);

  useEffect(() => {
    api.get(`/api/admin/combos/${id}/details`)
      .then(res => setCombo(res.data))
      .catch(() => toast.error("Combo not found"));
  }, [id]);

  if (!combo) return null;

  // ✅ PRICE CALCULATIONS
  const totalFoodMrp = combo.foods.reduce((sum, food) => sum + food.mrp, 0);
  const totalFoodSelling = combo.foods.reduce(
    (sum, food) => sum + food.sellingPrice,
    0
  );
  const comboSavings = totalFoodMrp - combo.comboPrice;

  const handleAddCombo = async () => {
    setLoading(true);
    await addComboToCart(combo);
    toast.success("Combo added to cart");
    navigate("/cart");
  };

  return (
    <div className="container py-5 combo-details">

      <div className="row justify-content-center">
        <div className="col-lg-9">

          <div className="card combo-card">

            {/* IMAGE */}
            <img
              src={combo.imageUrl}
              alt={combo.name}
              className="combo-banner"
            />

            <div className="card-body p-4">

              {/* TITLE */}
              <h2 className="combo-title">{combo.name}</h2>

              {/* PRICE SUMMARY */}
              <div className="price-summary">

                <div className="row text-center align-items-center">

                  <div className="col-md-4">
                    <p className="label">Total Food Price</p>
                    <h5 className="price old">₹{totalFoodMrp}</h5>
                  </div>

                  <div className="col-md-4">
                    <p className="label">Combo Price</p>
                    <h2 className="combo-price">₹{combo.comboPrice}</h2>
                    <span className="badge best-deal">Best Deal 🔥</span>
                  </div>

                  <div className="col-md-4">
                    <p className="label">You Save</p>
                    <h5 className="price save">₹{comboSavings}</h5>
                  </div>

                </div>
              </div>

              {/* INCLUDED ITEMS */}
              <h5 className="section-title">Included Items</h5>

              <div className="row">
                {combo.foods.map(food => (
                  <div key={food.id} className="col-md-6 mb-3">

                    <div className="food-item">

                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="food-img"
                      />

                      <div>
                        <h6 className="food-name">{food.name}</h6>

                        <p className="food-price">
                          ₹{food.mrp}
                        </p>

                        {food.sellingPrice < food.mrp && (
                          <p className="food-save">
                            Save ₹{food.mrp - food.sellingPrice}
                          </p>
                        )}
                      </div>

                    </div>

                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                className="btn combo-btn"
                disabled={loading}
                onClick={handleAddCombo}
              >
                {loading
                  ? "Adding Combo..."
                  : `Add Combo & Save ₹${comboSavings}`}
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ComboDetails;
