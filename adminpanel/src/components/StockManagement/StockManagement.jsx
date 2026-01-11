import React, { useEffect, useState } from "react";
import { useAdminFood } from "../../context/AdminFoodContext";

const DEFAULT_IMAGE = "/mnt/data/f931bf2b-1981-424f-bb48-85d109bc47aa.png";

const StockManagement = () => {
  const {
    foods,
    loading,
    page,
    totalPages,
    fetchFoods,
    setStock,
    deleteFood,
  } = useAdminFood();

  const [search, setSearch] = useState("");
  const [lowFirst, setLowFirst] = useState(false);
  const [quantitySort, setQuantitySort] = useState(null);
  const [editing, setEditing] = useState({});

  useEffect(() => {
    fetchFoods(0);
  }, []);

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
    const parsed = parseInt(editing[id], 10);
    if (isNaN(parsed) || parsed < 0) return;

    await setStock(id, parsed);

    setEditing((s) => {
      const c = { ...s };
      delete c[id];
      return c;
    });
  };

  // ===== Sorting =====
  const displayedFoods = () => {
    let arr = [...foods];

    if (lowFirst) {
      arr.sort((a, b) => {
        const s = (x) => (x.outOfStock ? 0 : x.lowStock ? 1 : 2);
        return s(a) - s(b);
      });
    }

    if (quantitySort === "asc") {
      arr.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    } else if (quantitySort === "desc") {
      arr.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    }

    return arr;
  };

  return (
    <div className="container py-4">
      {/* Controls */}
      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchFoods(0, false, search)}
        />

        <button
          className="btn btn-primary"
          onClick={() => fetchFoods(0, false, search)}
        >
          Search
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            setSearch("");
            fetchFoods(0);
          }}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <table className="table table-striped mb-0 align-middle">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Stock</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : displayedFoods().length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No foods
                </td>
              </tr>
            ) : (
              displayedFoods().map((f) => (
                <tr key={f.id}>
                  <td>
                    <img
                      src={f.imageUrl || DEFAULT_IMAGE}
                      width={48}
                      height={48}
                      alt=""
                    />
                  </td>

                  <td>{f.name}</td>

                  <td>
                    {editing[f.id] !== undefined ? (
                      <input
                        className="form-control form-control-sm"
                        value={editing[f.id]}
                        autoFocus
                        onChange={(e) =>
                          onEditChange(f.id, e.target.value)
                        }
                        onBlur={() => saveInline(f.id)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && saveInline(f.id)
                        }
                      />
                    ) : (
                      <strong
                        style={{ cursor: "pointer" }}
                        onDoubleClick={() => startEdit(f.id, f.stock)}
                      >
                        {f.stock}
                      </strong>
                    )}
                  </td>

                  <td>
                    {f.outOfStock ? (
                      <span className="badge bg-danger">Out of Stock</span>
                    ) : f.lowStock ? (
                      <span className="badge bg-warning text-dark">
                        Low Stock
                      </span>
                    ) : (
                      <span className="badge bg-success">In Stock</span>
                    )}
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteFood(f.id)}
                    >
                      Delete
                    </button>
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
            disabled={page === 0}
            onClick={() => fetchFoods(page - 1)}
          >
            Prev
          </button>

          Page {page + 1} / {totalPages}

          <button
            className="btn btn-outline-primary ms-2"
            disabled={page + 1 >= totalPages}
            onClick={() => fetchFoods(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
