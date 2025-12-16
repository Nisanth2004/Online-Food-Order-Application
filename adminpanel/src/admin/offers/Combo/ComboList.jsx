import { useEffect, useState } from "react";
import { getAllCombos, deleteCombo } from "../../../services/ComboService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import BackHeader from "../../../components/BackHeader";

const ComboList = () => {
  const [combos, setCombos] = useState([]);

  const load = async () => {
    const res = await getAllCombos();
    setCombos(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this combo?")) return;
    await deleteCombo(id);
    toast.success("Combo deleted");
    load();
  };

  // 🔵 CHECK IF COMBO IS EXPIRED
  const isExpired = (endTime) => {
    if (!endTime) return false;
    return new Date(endTime) < new Date();
  };

  // 🔵 FORMAT DATE & TIME (READABLE)
  const formatDateTime = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="container py-4">
      <BackHeader title="Combos" />

      <div className="d-flex justify-content-between mb-3">
        <h3>Combos</h3>
        <Link className="btn btn-primary" to="/admin/offers/combos/new">
          + New Combo
        </Link>
      </div>

      <table className="table align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {combos.length ? (
            combos.map((c) => {
              const expired = isExpired(c.endTime);

              return (
                <tr
                  key={c.id}
                  style={{
                    opacity: expired ? 0.6 : 1,
                    backgroundColor: expired ? "#f8f9fa" : "transparent",
                  }}
                >
                  <td>{c.name}</td>

                  <td>₹{c.comboPrice}</td>

                  <td>
                    {expired ? (
                      <span className="badge bg-danger">Expired</span>
                    ) : c.active ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </td>

                  <td>
                    <div>
                      <strong>From:</strong> {formatDateTime(c.startTime)}
                    </div>
                    <div>
                      <strong>To:</strong> {formatDateTime(c.endTime)}
                    </div>
                  </td>

                  <td>
                    <Link
                      className={`btn btn-sm btn-outline-primary me-2 ${
                        expired ? "disabled" : ""
                      }`}
                      to={`/admin/offers/combos/edit/${c.id}`}
                    >
                      Edit
                    </Link>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      disabled={expired}
                      onClick={() => remove(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No combos found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ComboList;
