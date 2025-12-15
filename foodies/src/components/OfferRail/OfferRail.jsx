import React, { useEffect, useState } from "react";
import "./OfferRail.css";

const OfferRail = ({ title, items = [], type, onClick }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!items.length || paused) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [items, paused]);

  if (!items.length) return null;

  return (
    <section className="offer-rail">
      <h4>{title}</h4>

      <div
        className="banner-wrapper"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="banner-track"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: "transform 0.6s ease",
          }}
        >
          {items.map((item) => (
            <div className="banner-slide" key={item.id}>
              <img
                src={item.bannerImage || item.imageUrl}
                alt={item.title || item.name}
                className="clickable"
                onClick={() => onClick && onClick(item, type)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* DOTS */}
      <div className="banner-dots">
        {items.map((_, i) => (
          <span
            key={i}
            className={`dot ${index === i ? "active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
};

export default OfferRail;
