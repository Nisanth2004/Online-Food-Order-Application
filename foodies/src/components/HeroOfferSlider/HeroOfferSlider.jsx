import React, { useEffect, useRef, useState } from "react";
import "./HeroOfferSlider.css";

const HeroOfferSlider = ({ items, onClick }) => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!items || items.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 3500);

    return () => clearInterval(intervalRef.current);
  }, [items]);

  if (!items || !items.length) return null;

  return (
    <div className="hero-slider">
      <img
        src={items[index].bannerImage}
        alt="offer"
        className="hero-img clickable"
        onClick={() => onClick(items[index], "PROMOTION")}
      />

      <div className="hero-dots">
        {items.map((_, i) => (
          <span
            key={i}
            className={`dot ${index === i ? "active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroOfferSlider;   // ✅ THIS LINE IS REQUIRED
