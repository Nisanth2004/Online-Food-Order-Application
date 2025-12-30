import React from "react";
import "./CouponDrawer.css";

const CouponDrawer = ({
  open,
  onClose,
  coupons = [],
  appliedCoupon,
  subtotal,
  onApply,
   onRemove
}) => {
  if (!open) return null;

  return (
    <div className="coupon-overlay" onClick={onClose}>
      <div
        className="coupon-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="coupon-header">
          <h4>Apply Coupon</h4>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Coupon List */}
        {coupons.map((coupon) => {
          const isApplied = appliedCoupon === coupon.code;
          const isEligible = subtotal >= coupon.minOrderAmount;
          const isOtherApplied = appliedCoupon && !isApplied;

          return (
            <div
              key={coupon.id}
              className={`coupon-card
                ${isApplied ? "applied" : ""}
                ${!isEligible || isOtherApplied ? "disabled" : ""}
              `}
            >
              <div className="coupon-content">
                <div className="coupon-left">
                  <div className="coupon-tag">
                    {coupon.discountPercent}% OFF
                  </div>
                </div>

                <div className="coupon-middle">
                  <h5>{coupon.code}</h5>
                  <p className="desc">
                    Save {coupon.discountPercent}% on this order
                  </p>
                  <small>Min order ₹{coupon.minOrderAmount}</small>

                  {!isEligible && (
                    <p className="error-text">
                      Add ₹{coupon.minOrderAmount - subtotal} more to apply
                    </p>
                  )}
                </div>

                <div className="coupon-right">
                 {isApplied ? (
  <button
    className="remove-btn"
    onClick={() => onRemove()}
  >
    REMOVE
  </button>
) : (
  <button
    disabled={!isEligible || isOtherApplied}
    onClick={() => onApply(coupon)}
  >
    APPLY
  </button>
)}

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CouponDrawer;
