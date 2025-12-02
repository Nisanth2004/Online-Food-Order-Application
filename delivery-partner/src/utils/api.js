import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // <- change if needed
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});
// https://oil-8eta.onrender.com
export default api;
