import React, { useState } from "react";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";


import "./Home.css";

import { motion } from "framer-motion";
import HomeOffers from '../../components/HomeOffers/HomeOffers';
const Home = () => {
  const [category, setCategory] = useState("All");
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};
  return (
    <main className="container home-page">

      {/* 🌿 HERO ORGANIC OFFERS */}
      


      {/* 🌱 BRAND HEADER */}
      <Header />      {/* 🌿 Animated Organic Story */}


 

    
      <HomeOffers />



      {/* 🥬 CATEGORY */}
      <ExploreMenu category={category} setCategory={setCategory} />
      

      {/* 🥥 PRODUCTS */}
      <FoodDisplay category={category} searchText="" />



    </main>
  );
};

export default Home;
