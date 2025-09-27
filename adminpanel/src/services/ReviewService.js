import axios from "axios";

const BASE = "http://localhost:8080/api";

export const fetchAdminReviews = async () => {
  return await axios.get(`${BASE}/admin/reviews`);
};

export const deleteAdminReview = async (id, token) => {
  return await axios.delete(`${BASE}/admin/reviews/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const updateVerifiedStatus = async (id, verified) => {
  return await axios.put(`${BASE}/admin/reviews/${id}/verify?verified=${verified}`);
};
