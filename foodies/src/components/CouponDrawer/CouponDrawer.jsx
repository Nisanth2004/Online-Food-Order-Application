import React from "react";
import "./CouponDrawer.css";

const CouponDrawer = ({
  open,
  onClose,
  coupons,
  appliedCoupon,
  onApply
}) => {
  if (!open) return null;

  return (
    <div className="coupon-overlay">
      <div className="coupon-drawer">

        <div className="coupon-header">
          <h4>Available Coupons</h4>
          <button onClick={onClose}>✕</button>
        </div>

        {coupons.length === 0 && (
          <p className="text-muted text-center mt-4">
            No coupons available
          </p>
        )}

        {coupons.map(coupon => {
          const isApplied = appliedCoupon === coupon.code;
          const isDisabled = appliedCoupon && !isApplied;

          return (
            <div
              key={coupon.id}
              className={`coupon-card ${isApplied ? "applied" : ""} ${isDisabled ? "disabled" : ""}`}
            >
              <div className="coupon-left">
                {coupon.imageUrl && (
                  <img src={coupon.imageUrl} alt={coupon.code} />
                )}
              </div>

              <div className="coupon-middle">
                <h5>{coupon.code}</h5>
                <p>{coupon.discountPercent}% OFF</p>
                <small>
                  Min order ₹{coupon.minOrderAmount}
                </small>
              </div>

              <div className="coupon-right">
                {isApplied ? (
                  <span className="applied-badge">APPLIED</span>
                ) : (
                  <button
                    disabled={isDisabled}
                    onClick={() => onApply(coupon.code)}
                  >
                    APPLY
                  </button>
                )}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default CouponDrawer;
