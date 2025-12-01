import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // <- change if needed
  headers: { "Content-Type": "application/json" },
  withCredentials: false
});

export default api;
