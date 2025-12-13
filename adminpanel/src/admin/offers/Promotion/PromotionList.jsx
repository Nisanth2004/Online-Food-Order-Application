import React, { useEffect, useState } from "react";
import { getPromotions, deletePromotion } from "../../../services/PromotionService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import BackHeader from "../../../components/BackHeader";
const PromotionList = () => {
  const [promotions, setPromotions] = useState([]);

  const loadPromotions = async () => {
    try {
      const res = await getPromotions();
      setPromotions(res.data);
    } catch {
      toast.error("Failed to load promotions");
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this promotion?")) return;
    await deletePromotion(id);
    toast.success("Promotion deleted");
    loadPromotions();
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-3">
       <BackHeader title="Promotions" />

        <Link className="btn btn-primary" to="/admin/offers/promotions/new">
          + New Promotion
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map(p => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.type}</td>
              <td>
                {p.startTime && p.endTime
                  ? `${new Date(p.startTime).toLocaleDateString()} → ${new Date(p.endTime).toLocaleDateString()}`
                  : "N/A"}
              </td>
              <td>
                <span className={`badge ${p.active ? "bg-success" : "bg-secondary"}`}>
                  {p.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <Link
                  className="btn btn-sm btn-outline-primary me-2"
                  to={`/admin/offers/promotions/edit/${p.id}`}
                >
                  Edit
                </Link>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => remove(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PromotionList;
