import React, { useContext, useState,useEffect } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { calculateCartTotals } from '../../util/cartUtils';
import toast from "react-hot-toast";
import api from '../../../../adminpanel/src/services/CustomAxiosInstance';
import CouponDrawer from '../../components/CouponDrawer/CouponDrawer';



const Cart = () => {
  const navigate = useNavigate();
  
  const [couponDrawerOpen, setCouponDrawerOpen] = useState(false);
const [coupons, setCoupons] = useState([]);
  const [coupon, setCoupon] = useState(""); // ✅ FIXED
useEffect(() => {
  api.get("/api/admin/coupons/active")
    .then(res => setCoupons(res.data))
    .catch(() => toast.error("Failed to load coupons"));
}, []);

const handleApplyCoupon = async (coupon) => {
  try {
    const res = await api.post(
      "/api/admin/coupons/apply",
      null,
      {
        params: {
          code: coupon.code,
          subtotal: finalSubtotal
        }
      }
    );

    setDiscount(res.data.discount);
    setAppliedCoupon(res.data.code);

    toast.success(`Coupon ${res.data.code} applied`);
    setCouponDrawerOpen(false);
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Invalid or inactive coupon"
    );
  }
};



  const {
    increaseQty,
    decreaseQty,
    quantities,
    foodList,
    removeFromCart,
    setQuantities,
    taxRate,
    shippingCharge,
    discount,
    setDiscount,
    setAppliedCoupon,
     appliedCoupon,
    comboCart,
    cartLoading,
    increaseComboQty,
    decreaseComboQty,
    removeComboFromCart
  } = useContext(StoreContext);

  /* --------------------------------------------------
     FILTER OUT COMBO ITEMS FROM NORMAL CART
  -------------------------------------------------- */
  const comboFoodIds = comboCart
    ? comboCart.foods?.map(f => f.id) || []
    : [];

  const cartItems = foodList.filter(
    food =>
      quantities[food.id] > 0 &&
      !comboFoodIds.includes(food.id)
  );

  /* --------------------------------------------------
     TOTAL CALCULATIONS
  -------------------------------------------------- */
  const { subtotal, shipping, tax } =
    calculateCartTotals(cartItems, quantities, taxRate, shippingCharge);

  const comboTotal = comboCart
    ? comboCart.comboPrice * comboCart.qty
    : 0;

  const finalSubtotal = subtotal + comboTotal;

  const finalTotal = Math.max(
    finalSubtotal + shipping + tax - discount,
    0
  );

  /* --------------------------------------------------
     EMPTY / VISIBILITY FLAGS
  -------------------------------------------------- */
  const isCartEmpty = cartItems.length === 0 && !comboCart;
  const hasItems = cartItems.length > 0 || comboCart;

  /* --------------------------------------------------
     CLEAR CART (FIXED)
  -------------------------------------------------- */
  const clearCart = () => {
    const updated = {};
    foodList.forEach(food => {
      updated[food.id] = 0;
    });

    setQuantities(updated);
    removeComboFromCart();     // ✅ clear combo
    setDiscount(0);
    setAppliedCoupon(null);
    setCoupon("");

    toast.success("Cart cleared");
  };

  /* --------------------------------------------------
     APPLY COUPON (FIXED)
  -------------------------------------------------- */
  const applyCoupon = async () => {
    try {
      const res = await api.post(
        `/api/admin/coupons/apply?code=${coupon}&subtotal=${finalSubtotal}`
      );

      setDiscount(res.data.discount);
      setAppliedCoupon(coupon);
      toast.success("Coupon applied");
    } catch {
      toast.error("Invalid coupon");
    }
  };
  const handleRemoveCoupon = () => {
  setDiscount(0);
  setAppliedCoupon(null);
  toast.success("Coupon removed");
};

 if (cartLoading) {
  return (
    <div className="container py-5 cart-page">
      <h1 className="cart-title text-center mb-5">
        <span className="gradient-text">Your Cart</span>
      </h1>

      <div className="row">
        {/* LEFT SIDE SKELETON */}
        <div className="col-lg-8">
          {[1, 2].map(i => (
            <div
              key={i}
              className="card cart-card shadow-soft border-0 mb-4 skeleton-card"
            >
              <div className="card-body d-flex gap-3">
                <div className="skeleton-img"></div>

                <div className="flex-grow-1">
                  <div className="skeleton-line w-50 mb-2"></div>
                  <div className="skeleton-line w-30 mb-3"></div>
                  <div className="skeleton-qty"></div>
                </div>

                <div className="skeleton-price"></div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE SUMMARY SKELETON */}
        <div className="col-lg-4">
          <div className="card cart-summary shadow-soft border-0 skeleton-card">
            <div className="card-body">
              <div className="skeleton-line w-100 mb-3"></div>
              <div className="skeleton-line w-100 mb-3"></div>
              <div className="skeleton-line w-100 mb-3"></div>
              <div className="skeleton-line w-60 mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



  return (
    <div className="container py-5 cart-page">

      <h1 className="cart-title text-center mb-5">
        <span className="gradient-text">Your Cart</span>
      </h1>

      <div className="row">

        {/* LEFT SIDE */}
        <div className="col-lg-8">

          {isCartEmpty ? (
            <div className="empty-cart text-center p-5 shadow-soft rounded-4">
              <h4>Your cart is empty</h4>
              <p className="text-muted">Add items to checkout faster!</p>
              <Link to="/" className="btn btn-gradient mt-3">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="card cart-card shadow-soft border-0 mb-4">
              <div className="card-body">

                {/* Clear Cart */}
                <div className="d-flex justify-content-end mb-3">
                  <button className="clear-cart-btn" onClick={clearCart}>
                    Clear Cart
                  </button>
                </div>

                {/* COMBO CARD */}
                {comboCart && (
                  <div
                    className="card mb-4 shadow-soft combo-cart-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/combos/${comboCart.id}`)}
                  >
                    <div className="card-body d-flex justify-content-between align-items-center">

                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={comboCart.imageUrl}
                          alt={comboCart.name}
                          style={{ width: 80, borderRadius: 12 }}
                        />

                        <div>
                          <h5 className="mb-1">{comboCart.name}</h5>
                          <p className="mb-1">
                            ₹{comboCart.comboPrice} × {comboCart.qty}
                          </p>
                          <strong className="text-success">
                            ₹{comboCart.comboPrice * comboCart.qty}
                          </strong>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            decreaseComboQty();
                          }}
                        >
                          −
                        </button>

                        <span>{comboCart.qty}</span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            increaseComboQty();
                          }}
                        >
                          +
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeComboFromCart();
                          }}
                        >
                          Remove
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* NORMAL FOOD ITEMS */}
                {cartItems.map(food => (
                  <div key={food.id} className="row cart-item align-items-center mb-4">

                    <div className="col-4 col-md-3 text-center">
                      <div className="img-wrapper">
                        <img
                          src={food.imageUrl}
                          alt={food.name}
                          className="cart-img zoom-img"
                        />
                      </div>
                    </div>

                    <div className="col-8 col-md-4">
                      <h5 className="fw-semibold">{food.name}</h5>
                      <div style={{ fontSize: 12, color: "#777" }}>
                        {(food.categories || []).join(", ")}
                      </div>
                    </div>

                    <div className="col-12 col-md-3 mt-3 mt-md-0">
                      <div className="qty-stock-wrapper">
                        <div className="quantity-box animated-box">
                          <button
                            className="qty-btn"
                            onClick={() => decreaseQty(food.id)}
                          >
                            −
                          </button>

                          <span className="qty-display">
                            {quantities[food.id]}
                          </span>

                          <button
                            className="qty-btn"
                            onClick={() => {
                              if (quantities[food.id] < food.stock)
                                increaseQty(food.id);
                              else
                                toast.error(`Only ${food.stock} in stock`);
                            }}
                          >
                            +
                          </button>
                        </div>

                        <p className="text-muted small stock-left-text mb-0">
                          Stock Left: {food.stock - quantities[food.id]}
                        </p>
                      </div>
                    </div>

                    <div className="col-12 col-md-2 text-center text-md-end mt-3 mt-md-0">
                      <p className="fw-bold fs-5 price-animate">
                        ₹{(food.price * quantities[food.id]).toFixed(2)}
                      </p>
                      <button
                        className="btn btn-sm btn-remove"
                        onClick={() => removeFromCart(food.id)}
                      >
                        Remove
                      </button>
                    </div>

                  </div>
                ))}

              </div>
            </div>
          )}

          <div className="text-start mb-4">
            <Link to="/" className="btn btn-outline-secondary back-btn">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE SUMMARY */}
        {hasItems && (
          <div className="col-lg-4">
            <div className="card cart-summary shadow-soft border-0">
              <div className="card-body">

                 {/* VIEW COUPONS */}
                 {appliedCoupon && (
  <div className="coupon-applied-strip">
    🎉 Coupon <strong>{appliedCoupon}</strong> applied
  </div>
)}

              <div
  className="coupon-cta-card"
  onClick={() => setCouponDrawerOpen(true)}
>
  <div className="coupon-cta-left">
    <div className="coupon-icon">🎟</div>
    <div>
      <h6>Apply Coupon</h6>
      <p>Save more on this order</p>
    </div>
  </div>

  <div className="coupon-cta-right">
    <span className="view-text">View</span>
    <span className="arrow">›</span>
  </div>
</div>



                <h4 className="fw-bold mb-4 mt-4">Order Summary</h4>

                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>₹{finalSubtotal.toFixed(2)}</span>
                </div>

                <div className="summary-line">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>

                <div className="summary-line">
                  <span>Tax ({taxRate}%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="summary-line text-success">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <hr />

                <div className="summary-line total">
                  <strong>Total</strong>
                  <strong>₹{finalTotal.toFixed(2)}</strong>
                </div>

                <button
                  className="btn btn-gradient w-100 mt-3"
                  onClick={() => navigate('/order')}
                >
                  Proceed to Checkout
                </button>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* COUPON DRAWER */}
      <CouponDrawer
        open={couponDrawerOpen}
        onClose={() => setCouponDrawerOpen(false)}
        coupons={coupons}
        appliedCoupon={appliedCoupon}
        subtotal={finalSubtotal}
        onApply={handleApplyCoupon}
        onRemove={handleRemoveCoupon} 
      />
    </div>
  );
};

export default Cart;
