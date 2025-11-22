import React, { useEffect, useState } from "react";
import { getFoodList, setStock, deleteFood } from "../services/FoodService";
import { toast } from "react-toastify";

const DEFAULT_IMAGE = "/mnt/data/f931bf2b-1981-424f-bb48-85d109bc47aa.png";

const StockManagement = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize] = useState(999);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  const [lowFirst, setLowFirst] = useState(false);
  const [quantitySort, setQuantitySort] = useState(null); // asc | desc | null

  const [editing, setEditing] = useState({});

  const fetchFoods = async (pageNumber = 0, searchTerm = search) => {
    try {
      setLoading(true);
      const resp = await getFoodList(pageNumber, pageSize, null, searchTerm);
      setFoods(resp.foods || []);
      setPage(resp.currentPage || 0);
      setTotalPages(resp.totalPages || 1);
    } catch {
      toast.error("Failed to load foods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods(0);
  }, []);

  const updateFoodInState = (id, newData) => {
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, ...newData } : f)));
  };

  // ===== Inline edit =====
  const startEdit = (id, current) => {
    setEditing((s) => ({ ...s, [id]: String(current) }));
  };

  const onEditChange = (id, value) => {
    if (value === "" || /^[0-9]*$/.test(value)) {
      setEditing((s) => ({ ...s, [id]: value }));
    }
  };

  const saveInline = async (id) => {
    const value = editing[id];
    const parsed = parseInt(value, 10);

    if (isNaN(parsed) || parsed < 0) {
      toast.error("Invalid stock");
      return;
    }

    const previous = foods.find((f) => f.id === id)?.stock;

    updateFoodInState(id, { stock: parsed });

    try {
      await setStock(id, parsed);
      toast.success("Stock updated");
      setEditing((s) => {
        const c = { ...s };
        delete c[id];
        return c;
      });
    } catch {
      updateFoodInState(id, { stock: previous });
      toast.error("Update failed");
    }
  };

  // ===== Sorting =====
  const getDisplayedFoods = () => {
    let arr = [...foods];

    if (lowFirst) {
      arr.sort((a, b) => {
        const score = (x) => (x.outOfStock ? 0 : x.lowStock ? 1 : 2);
        return score(a) - score(b);
      });
    }

    if (quantitySort === "asc") {
      arr.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    } else if (quantitySort === "desc") {
      arr.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    }

    return arr;
  };

  // ===== Status Cell =====
  const StatusCell = ({ f }) => {
    const threshold = f.lowStockThreshold || 5;
    const base = Math.max(threshold * 4, (f.stock || 0) + threshold, 10);
    const pct = Math.min(Math.round(((f.stock || 0) / base) * 100), 100);

    const color = f.outOfStock
      ? "bg-danger"
      : f.lowStock
      ? "bg-warning"
      : "bg-success";

    return (
      <td style={{ minWidth: 220 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="progress" style={{ height: 10, borderRadius: 8 }}>
            <div
              className={`progress-bar ${color}`}
              style={{ width: `${pct}%`, borderRadius: 8 }}
            ></div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600 }}>
            {f.outOfStock
              ? "Out of Stock"
              : f.lowStock
              ? `Low Stock (≤ ${threshold})`
              : "In Stock"}
          </div>
        </div>
      </td>
    );
  };

  const confirmDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await deleteFood(id);
      setFoods((prev) => prev.filter((f) => f.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="container py-4">
      {/* TOP CONTROLS */}
      <div className="d-flex mb-3 align-items-center gap-2">
        <input
          className="form-control"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchFoods(0, search)}
        />

        <button className="btn btn-primary" onClick={() => fetchFoods(0, search)}>
          Search
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            setSearch("");
            fetchFoods(0, "");
          }}
        >
          Reset
        </button>

        {/* SORT DROPDOWN */}
        <div className="ms-auto">
          <div className="dropdown">
            <button
              className="btn btn-outline-primary btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ minWidth: 120 }}
            >
              Sort
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  className={`dropdown-item ${lowFirst ? "active" : ""}`}
                  onClick={() => setLowFirst((v) => !v)}
                >
                  {lowFirst ? "✓ " : ""}Low Stock First
                </button>
              </li>

              <li><hr className="dropdown-divider" /></li>

              <li>
                <button
                  className={`dropdown-item ${quantitySort === "asc" ? "active" : ""}`}
                  onClick={() => setQuantitySort("asc")}
                >
                  {quantitySort === "asc" ? "✓ " : ""}Qty Asc (↑)
                </button>
              </li>

              <li>
                <button
                  className={`dropdown-item ${quantitySort === "desc" ? "active" : ""}`}
                  onClick={() => setQuantitySort("desc")}
                >
                  {quantitySort === "desc" ? "✓ " : ""}Qty Desc (↓)
                </button>
              </li>

              <li><hr className="dropdown-divider" /></li>

              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => {
                    setLowFirst(false);
                    setQuantitySort(null);
                  }}
                >
                  Reset Sorting
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card-body p-0">
          <table className="table table-striped mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 64 }}>Image</th>
                <th>Name</th>
                <th style={{ width: 140 }}>Stock</th>
                <th style={{ minWidth: 220 }}>Status</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    Loading...
                  </td>
                </tr>
              ) : getDisplayedFoods().length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    No items
                  </td>
                </tr>
              ) : (
                getDisplayedFoods().map((f) => (
                  <tr key={f.id}>
                    <td>
                      <img
                        src={f.imageUrl || DEFAULT_IMAGE}
                        alt={f.name}
                        width={48}
                        height={48}
                        style={{ borderRadius: 6, objectFit: "cover" }}
                      />
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: "#777" }}>
                        {(f.categories || []).join(", ")}
                      </div>
                    </td>

                    <td>
                      {editing[f.id] !== undefined ? (
                        <input
                          className="form-control form-control-sm"
                          value={editing[f.id]}
                          onChange={(e) => onEditChange(f.id, e.target.value)}
                          onBlur={() => saveInline(f.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveInline(f.id);
                            if (e.key === "Escape")
                              setEditing((s) => {
                                const c = { ...s };
                                delete c[f.id];
                                return c;
                              });
                          }}
                          autoFocus
                        />
                      ) : (
                        <div
                          style={{
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                          onDoubleClick={() => startEdit(f.id, f.stock)}
                        >
                          {f.stock}
                        </div>
                      )}
                    </td>

                    <StatusCell f={f} />

                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => startEdit(f.id, f.stock)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => confirmDelete(f.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-3 text-center">
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => fetchFoods(page - 1)}
              disabled={page === 0}
            >
              Prev
            </button>
            Page {page + 1} / {totalPages}
            <button
              className="btn btn-outline-primary ms-2"
              onClick={() => fetchFoods(page + 1)}
              disabled={page + 1 >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
