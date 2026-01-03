import React from "react";
import "./CouponDrawer.css";

const CouponDrawer = ({
  open,
  onClose,
  coupons = [],
  appliedCoupon,
  subtotal,
  onApply,
  onRemove,
  autoAppliedCoupon,
  loading = false // 👈 NEW
}) => {
  if (!open) return null;

  const now = new Date();

  const activeCoupons = coupons.filter(coupon => {
    if (!coupon.active) return false;
    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) return false;
    return true;
  });

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

        {/* 🔥 SKELETON STATE */}
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="coupon-card skeleton-card">
                <div className="coupon-content">
                  <div className="skeleton-tag shimmer" />
                  <div className="skeleton-middle">
                    <div className="skeleton-line shimmer w-60" />
                    <div className="skeleton-line shimmer w-80" />
                    <div className="skeleton-line shimmer w-40" />
                  </div>
                  <div className="skeleton-btn shimmer" />
                </div>
              </div>
            ))}
          </>
        ) : (
          /* ✅ REAL COUPONS */
          activeCoupons.map((coupon) => {
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
                    {coupon.code === autoAppliedCoupon && (
                      <span className="best-badge">BEST</span>
                    )}

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
                        onClick={onRemove}
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
          })
        )}
      </div>
    </div>
  );
};

export default CouponDrawer;
