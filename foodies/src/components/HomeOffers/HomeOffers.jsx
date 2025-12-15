import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../service/CustomAxiosInstance";
import HeroOfferSlider from "../HeroOfferSlider/HeroOfferSlider";
import OfferRail from "../OfferRail/OfferRail";

const HomeOffers = () => {
  const navigate = useNavigate();

  // ✅ DEFINE STATES (THIS WAS MISSING)
  const [promotions, setPromotions] = useState([]);
  const [combos, setCombos] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // ✅ LOAD DATA
  useEffect(() => {
    api.get("/api/admin/promotions/active")
      .then(res => setPromotions(res.data || []))
      .catch(console.error);

    api.get("/api/admin/combos/active")
      .then(res => setCombos(res.data || []))
      .catch(console.error);

    api.get("/api/admin/coupons/active")
      .then(res => setCoupons(res.data || []))
      .catch(console.error);
  }, []);

  // ✅ CLICK HANDLER
  const handleBannerClick = (item, typeFromRail) => {

    // 🎯 HERO PROMOTION CLICK
    if (item.redirectType) {
      if (item.redirectType === "COMBO") {
        navigate(`/combo/${item.redirectValue}`);
      }

      if (item.redirectType === "CATEGORY") {
        navigate(`/?category=${item.redirectValue}`);
      }

      if (item.redirectType === "PRODUCT") {
        navigate(`/food/${item.redirectValue}`);
      }

      return;
    }

    // 🎯 RAIL CLICK
    if (typeFromRail === "COMBO") {
      navigate(`/combo/${item.id}`);
    }

    if (typeFromRail === "COUPON") {
      navigate("/cart");
    }
  };

  return (
    <>
      {/* HERO SLIDER */}
      <HeroOfferSlider
        items={promotions}
        onClick={handleBannerClick}
      />

      {/* COMBO DEALS */}
      <OfferRail
        title="🔥 Combo Deals"
        items={combos}
        type="COMBO"
        onClick={handleBannerClick}
      />

      {/* COUPONS */}
      <OfferRail
        title="🏷️ Coupons For You"
        items={coupons}
        type="COUPON"
        onClick={handleBannerClick}
      />
    </>
  );
};

export default HomeOffers;
