import api from "./CustomAxiosInstance";


const ADMIN_API = "/api/admin/reviews";

export const fetchAdminReviews = async () => {
  return await api.get(ADMIN_API);
};

export const deleteAdminReview = async (id, token) => {
  return await api.delete(`${ADMIN_API}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const updateVerifiedStatus = async (id, verified) => {
  return await api.put(`${ADMIN_API}/${id}/verify?verified=${verified}`);
};
