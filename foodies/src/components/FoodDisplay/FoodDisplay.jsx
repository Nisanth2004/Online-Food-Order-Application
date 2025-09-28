import React, { useContext } from "react";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category, searchText }) => {
  const { foodList } = useContext(StoreContext);

  // Sort first by sponsored, then featured, then others
  const sortedFoods = [...foodList].sort((a, b) => {
    if (a.sponsored && !b.sponsored) return -1;
    if (!a.sponsored && b.sponsored) return 1;
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0; // keep original order otherwise
  });

  // Filter by category and search text
  const filteredFoods = sortedFoods.filter(
    (food) =>
      (category === "All" || food.categories.includes(category)) &&
      food.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="container">
      <div className="row">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => (
            <FoodItem
              key={food.id}
              id={food.id}
              name={food.name}
              description={food.description}
              price={food.price}
              imageUrl={food.imageUrl}
              sponsored={food.sponsored}
              featured={food.featured}
              averageRating={food.averageRating}
              reviewCount={food.reviewCount}
            />
          ))
        ) : (
          <div className="text-center mt-4">
            <h4>No foods found</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
