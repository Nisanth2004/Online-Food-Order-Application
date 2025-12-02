import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/CustomAxiosInstance";


const API = "/api/admin/couriers"; 

export default function CourierManagement() {
  const [couriers, setCouriers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    trackUrl: "",
  });

  const loadCouriers = async () => {
    try {
      const res = await api.get(API);
      setCouriers(res.data);
    } catch (e) {
      console.log("Failed to load couriers:", e);
    }
  };

  useEffect(() => {
    loadCouriers();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setForm({ name: "", trackUrl: "" });
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      trackUrl: c.trackUrl,
    });
    setModalOpen(true);
  };

  const saveCourier = async () => {
    if (!form.name.trim()) return;

    try {
      if (editId) {
        await api.put(`${API}/${editId}`, form);
        toast.success("Courier updated");
      } else {
        await api.post(API, form);
        toast.success("Courier added");
      }

      setModalOpen(false);
      loadCouriers();
    } catch (e) {
      toast.error("Failed to save courier");
    }
  };

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const setDefaultCourier = async (id) => {
    try {
      await api.put(`${API}/default/${id}`);
      loadCouriers();

      setHighlightId(id);
      toast.success("Successfully set as default courier partner");

      setTimeout(() => setHighlightId(null), 1200);
    } catch (e) {
      console.log("Failed to set default courier:", e);
    }
  };

  const unsetDefaultCourier = async () => {
    try {
      await api.put(`${API}/default/remove`);
      toast.info("Default courier removed");
      loadCouriers();
    } catch (e) {
      console.log("Failed to remove default courier:", e);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`${API}/${deleteId}`);
      toast.success("Courier deleted");

      setDeleteModalOpen(false);
      loadCouriers();
    } catch (e) {
      toast.error("Failed to delete courier");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fw-bold text-dark">Courier Management</h3>
            <button className="btn btn-primary" onClick={openAdd}>
              + Add Courier
            </button>
          </div>

          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Courier Name</th>
                <th>Tracking URL</th>
                <th>Default</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {couriers.map((c) => (
                <tr
                  key={c.id}
                  className={highlightId === c.id ? "table-success" : ""}
                  style={{
                    transition: "0.3s",
                  }}
                >
                  <td>{c.name}</td>

                  <td>
                    <a href={c.trackUrl} target="_blank" rel="noreferrer">
                      {c.trackUrl}
                    </a>
                  </td>

                  <td style={{ width: "200px" }}>
                    <div className="d-flex align-items-center gap-2">
                      {c.isDefault ? (
                        <>
                          <span className="badge bg-success">Default</span>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={unsetDefaultCourier}
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setDefaultCourier(c.id)}
                          disabled={couriers.some((x) => x.isDefault)}
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="text-center" style={{ width: "160px" }}>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="btn btn-warning btn-sm"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>

                      <button
                        onClick={() => openDeleteConfirm(c.id)}
                        className="btn btn-danger btn-sm"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {couriers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-3">
                    No couriers added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title text-dark">
                  {editId ? "Edit Courier" : "Add Courier"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body">
                <label className="form-label fw-semibold">Courier Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control mb-3"
                />

                <label className="form-label fw-semibold">Tracking URL</label>
                <input
                  name="trackUrl"
                  value={form.trackUrl}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button className="btn btn-primary" onClick={saveCourier}>
                  {editId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  className="btn-close"
                  onClick={() => setDeleteModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body">
                <p className="mb-0 fw-semibold">
                  Are you sure you want to delete this courier?
                </p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>

                <button className="btn btn-danger" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
