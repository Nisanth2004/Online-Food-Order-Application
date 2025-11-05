import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// ✅ Public endpoints — include `/api` now since we removed it from baseURL
const PUBLIC_PATHS = [
  "/api/login",
  "/api/register",
  "/api/foods",
  "/api/categories",
  "/api/orders/all",
  "/api/orders/status",
  "/api/orders/approve-cancel",
  "/api/admin",
];

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // ✅ Determine if the request is public
  const isPublic = PUBLIC_PATHS.some((path) => config.url?.startsWith(path));

  // ✅ Only attach token for non-public requests
  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

// ✅ Optional: handle expired/invalid tokens
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      console.warn("Token invalid or expired — clearing local storage");
      localStorage.removeItem("token");
      // optional redirect:
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;
