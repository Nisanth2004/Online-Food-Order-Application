import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getFoodList,
  deleteFood as apiDeleteFood,
  setStock as apiSetStock,
} from "../services/FoodService";
import { toast } from "react-toastify";

const AdminFoodContext = createContext();
export const useAdminFood = () => useContext(AdminFoodContext);

export const AdminFoodProvider = ({ children }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 🔹 Fetch foods
  const fetchFoods = async (pageNumber = 0, silent = false, search = "") => {
    try {
      if (!silent) setLoading(true);

      const res = await getFoodList(pageNumber, 999, null, search);

      setFoods(res.foods || []);
      setPage(res.currentPage || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      toast.error("Failed to load foods");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 🔹 Update stock (optimistic)
  const setStock = async (id, value) => {
    const previous = foods.find((f) => f.id === id)?.stock;

    setFoods((prev) =>
      prev.map((f) => (f.id === id ? { ...f, stock: value } : f))
    );

    try {
      await apiSetStock(id, value);
      toast.success("Stock updated");
    } catch {
      setFoods((prev) =>
        prev.map((f) => (f.id === id ? { ...f, stock: previous } : f))
      );
      toast.error("Stock update failed");
    }
  };

  // 🔹 Delete food
  const deleteFood = async (id) => {
    if (!window.confirm("Delete this food?")) return;

    try {
      await apiDeleteFood(id);
      setFoods((prev) => prev.filter((f) => f.id !== id));
      toast.success("Food deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // 🚀 Load once globally
  useEffect(() => {
    fetchFoods(0);
  }, []);

  return (
    <AdminFoodContext.Provider
      value={{
        foods,
        loading,
        page,
        totalPages,
        fetchFoods,
        setStock,
        deleteFood,
      }}
    >
      {children}
    </AdminFoodContext.Provider>
  );
};
