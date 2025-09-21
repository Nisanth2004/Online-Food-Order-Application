import axios from "axios";

const API_BASE = "http://localhost:8080/api/categories";

export const fetchCategories = async () => {
  return axios.get(API_BASE);
};

export const addCategory = async (category) => {
  return axios.post(API_BASE, category);
};

export const deleteCategory = async (id) => {
  return axios.delete(`${API_BASE}/${id}`);
};
