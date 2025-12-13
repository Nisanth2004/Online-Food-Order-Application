import { useEffect, useState } from "react";
import { getAllCombos, deleteCombo } from "../../../services/ComboService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import BackHeader from "../../../components/BackHeader";
const ComboList = () => {
  const [combos, setCombos] = useState([]);

  const load = async () => {
    const res = await getAllCombos();
    setCombos(res.data);
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

  return (
    <div className="container py-4">
        <BackHeader title="Combos" />

      <div className="d-flex justify-content-between mb-3">
        <h3>Combos</h3>
        <Link className="btn btn-primary" to="/admin/offers/combos/new">
          + New Combo
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Active</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {combos.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>₹{c.comboPrice}</td>
              <td>
                {c.active ? (
                  <span className="badge bg-success">Active</span>
                ) : (
                  <span className="badge bg-secondary">Inactive</span>
                )}
              </td>
              <td>
                {c.startTime} → {c.endTime}
              </td>
              <td>
                <Link
                  className="btn btn-sm btn-outline-primary me-2"
                  to={`/admin/offers/combos/edit/${c.id}`}
                >
                  Edit
                </Link>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => remove(c.id)}
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

export default ComboList;
