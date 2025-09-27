import React, { useEffect, useState } from "react";
import {
  fetchAdminReviews,
  deleteAdminReview,
  updateVerifiedStatus,
} from "../../services/ReviewService";
import { toast } from "react-toastify";
import "./AdminReview.css";

const AdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminReviews();
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteAdminReview(id);
      toast.success("Review deleted");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete review");
    }
  };

  const handleToggleVerified = async (id, current) => {
    try {
      const res = await updateVerifiedStatus(id, !current);
      toast.success(`Review marked as ${res.data.verifiedPurchase ? "Verified" : "Not Verified"}`);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, verifiedPurchase: res.data.verifiedPurchase } : r
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update verified status");
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <div className="admin-reviews container py-5">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">All Reviews</h5>
          <div>
            <button
              className="btn btn-sm btn-outline-primary me-2"
              onClick={load}
            >
              Refresh
            </button>
            <span className="text-muted small">{reviews.length} reviews</span>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-muted py-4">No reviews found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Food</th>
                    <th>User</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Verified</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.foodName}</strong>
                        <div className="text-muted small">{r.foodId}</div>
                      </td>
                      <td>{r.user}</td>
                      <td>
                        <span className="rating-badge">{r.rating} ★</span>
                      </td>
                      <td className="comment-cell">{r.comment}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${
                            r.verifiedPurchase
                              ? "btn-success"
                              : "btn-outline-secondary"
                          }`}
                          onClick={() =>
                            handleToggleVerified(r.id, r.verifiedPurchase)
                          }
                        >
                          {r.verifiedPurchase ? "Verified" : "Mark Verified"}
                        </button>
                      </td>
                      <td>{formatDate(r.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReview;
