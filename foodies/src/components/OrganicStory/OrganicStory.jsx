import React from "react";
import "./OrganicStory.css";
import { assets } from '../../assets/assets';

const OrganicStory = () => {
  return (
    <section className="organic-story">
      <div className="story-content">
        <h2>Rooted in Nature 🌱</h2>
        <p>
          At <b>CocoGrand Organics</b>, we believe food should be grown the way
          nature intended — pure, chemical-free, and full of life.
        </p>
        <p>
          From trusted farms to your family, every product carries freshness,
          care, and honesty.
        </p>
      </div>

      <div className="story-image">
        <img
          src={assets.girl}
          alt="Organic farming"
        />
      </div>
    </section>
  );
};

export default OrganicStory;
