// src/services/CategoryService.js
import axios from 'axios';

const API_BASE = "http://localhost:8080/api/categories"; // Your backend endpoint

export const fetchCategories = async () => {
  return await axios.get(API_BASE);
};
