import axios from "axios";

// Global Axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:8080", // ✅ Global base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
