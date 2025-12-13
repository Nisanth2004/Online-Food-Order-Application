
import api from "./CustomAxiosInstance";


export const getActiveCombos = () =>
  api.get("/api/combos/active");

export const createCombo = (data) =>
  api.post("/api/combos", data);

export const getCoupons = () =>
  api.get("/api/coupons");

export const createCoupon = (data) =>
  api.post("/api/coupons", data);
