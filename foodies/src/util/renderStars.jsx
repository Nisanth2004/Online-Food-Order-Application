import React from "react";
import { Star } from "lucide-react";

export const renderStars = (rating = 0, size = 18) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="d-flex align-items-center">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} fill="#f5c518" stroke="#f5c518" />
      ))}

      {/* Half star */}
      {halfStar && (
        <div style={{ position: "relative", display: "inline-flex" }} key="half">
          <Star size={size} stroke="#f5c518" />
          <Star
            size={size}
            fill="#f5c518"
            stroke="#f5c518"
            style={{
              position: "absolute",
              width: "50%",
              overflow: "hidden",
              clipPath: "inset(0 50% 0 0)",
            }}
          />
        </div>
      )}

      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} stroke="#f5c518" />
      ))}
    </div>
  );
};
