import React, { useEffect, useMemo, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { getFoodList, setStock } from "../../services/FoodService";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

import { toast } from "react-toastify";
import "./StockDashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DEFAULT_IMAGE = "/mnt/data/f931bf2b-1981-424f-bb48-85d109bc47aa.png";

const StockDashboard = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState({});
  const [pageSize] = useState(9999);

  // fetch all foods
  const fetchAllFoods = async () => {
    try {
      setLoading(true);
      const resp = await getFoodList(0, pageSize);
      const list = (resp && resp.foods) || [];
      setFoods(list);
    } catch (err) {
      console.error("Failed loading foods", err);
      toast.error("Failed to load foods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFoods();
  }, []);

  // Derived stats
  const stats = useMemo(() => {
    let totalUnits = 0;
    let outOfStock = 0;
    let lowStock = 0;

    foods.forEach((f) => {
      const s = Number(f.stock || 0);
      totalUnits += s;
      if (f.outOfStock || s <= 0) outOfStock++;
      else if (f.lowStock || s <= (f.lowStockThreshold ?? 5)) lowStock++;
    });

    return {
      totalSKUs: foods.length,
      totalUnits,
      outOfStock,
      lowStock,
      inStock: foods.length - lowStock - outOfStock,
    };
  }, [foods]);

  const topMovers = useMemo(() => {
    return [...foods]
      .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
      .slice(0, 10);
  }, [foods]);

  const pieData = {
    labels: ["In stock", "Low stock", "Out of stock"],
    datasets: [
      {
        data: [stats.inStock, stats.lowStock, stats.outOfStock],
        backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
      },
    ],
  };

  const barData = {
    labels: topMovers.map((f) =>
      f.name.length > 18 ? f.name.slice(0, 15) + "…" : f.name
    ),
    datasets: [
      {
        label: "Orders",
        data: topMovers.map((f) => f.orderCount || 0),
        backgroundColor: topMovers.map((f) =>
          f.outOfStock ? "#d9534f" : "#4e73df"
        ),
      },
    ],
  };

  const startEdit = (id, currentStock) =>
    setEditing((s) => ({ ...s, [id]: String(currentStock) }));

  const cancelEdit = (id) =>
    setEditing((s) => {
      const c = { ...s };
      delete c[id];
      return c;
    });

  const saveInline = async (id) => {
    const val = editing[id];
    if (val == null) return;
    const parsed = parseInt(val, 10);
    if (Number.isNaN(parsed) || parsed < 0)
      return toast.error("Enter valid non-negative number");

    const prev = foods.find((f) => f.id === id);

    setFoods((prevList) =>
      prevList.map((f) =>
        f.id === id
          ? {
              ...f,
              stock: parsed,
              outOfStock: parsed <= 0,
              lowStock: parsed <= (f.lowStockThreshold ?? 5),
            }
          : f
      )
    );

    try {
      const updated = await setStock(id, parsed);
      if (updated && updated.id) {
        setFoods((prevList) =>
          prevList.map((f) => (f.id === id ? { ...f, ...updated } : f))
        );
      }
      toast.success("Stock updated");
    } catch (err) {
      console.error("update failed", err);
      setFoods((prevList) =>
        prevList.map((f) =>
          f.id === id ? { ...f, stock: prev.stock } : f
        )
      );
      toast.error("Update failed");
    } finally {
      cancelEdit(id);
    }
  };

  const exportCSV = () => {
    const header =
      "id,name,stock,lowStockThreshold,outOfStock,orderCount\n";
    const rows = foods
      .map(
        (f) =>
          `${f.id},"${(f.name || "").replace(/"/g, '""')}",${
            f.stock || 0
          },${f.lowStockThreshold || 5},${
            f.outOfStock ? 1 : 0
          },${f.orderCount || 0}`
      )
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock_snapshot_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lowStockRows = useMemo(() => {
    return foods
      .filter(
        (f) =>
          f.outOfStock ||
          f.lowStock ||
          Number(f.stock || 0) <= (f.lowStockThreshold ?? 5)
      )
      .sort((a, b) => (a.stock || 0) - (b.stock || 0));
  }, [foods]);

  return (
    <div className="stock-dashboard container py-4">
      <div className="d-flex gap-3 align-items-start mb-3">
        <div className="flex-grow-1">
          <h3 className="mb-1">Stock Dashboard</h3>
          <small className="text-muted">
            Overview of inventory & top movers
          </small>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={fetchAllFoods}
            disabled={loading}
          >
            Refresh
          </button>
          <button className="btn btn-outline-primary" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card summary-card">
            <div className="card-body">
              <div className="summary-title">SKUs</div>
              <div className="summary-value">{stats.totalSKUs}</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card summary-card">
            <div className="card-body">
              <div className="summary-title">Total units</div>
              <div className="summary-value">{stats.totalUnits}</div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card summary-card">
            <div className="card-body">
              <div className="summary-title">Low stock</div>
              <div className="summary-value text-warning">
                {stats.lowStock}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card summary-card">
            <div className="card-body">
              <div className="summary-title">Out of stock</div>
              <div className="summary-value text-danger">
                {stats.outOfStock}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-5">
          <div className="card">
            <div className="card-body">
              <h6>Stock distribution</h6>
              <Pie data={pieData} />
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card">
            <div className="card-body">
              <h6>Top movers (orders)</h6>
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Low stock table */}
      <div className="row">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">
                  Low / Out of stock items ({lowStockRows.length})
                </h6>
                <small className="text-muted">
                  Double-click stock to edit inline
                </small>
              </div>

              <div
                className="table-responsive"
                style={{ maxHeight: 360 }}
              >
                <table className="table table-sm table-hover mb-0 align-middle">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th style={{ width: 60 }}>Img</th>
                      <th>Name</th>
                      <th style={{ width: 120 }}>Stock</th>
                      <th style={{ width: 120 }}>Threshold</th>
                      <th style={{ width: 160 }}>Orders</th>
                      <th style={{ width: 150 }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lowStockRows.map((f) => (
                      <tr key={f.id} data-food-id={f.id}>
                        <td>
                          <img
                            src={f.imageUrl || DEFAULT_IMAGE}
                            alt={f.name}
                            width={48}
                            height={48}
                            style={{
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        </td>

                        <td style={{ minWidth: 220 }}>
                          <div style={{ fontWeight: 600 }}>{f.name}</div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#666",
                            }}
                          >
                            {(f.categories || []).join(", ")}
                          </div>
                        </td>

                        <td>
                          {editing[f.id] != null ? (
                            <div className="d-flex gap-2">
                              <input
                                value={editing[f.id]}
                                onChange={(e) =>
                                  setEditing((s) => ({
                                    ...s,
                                    [f.id]: e.target.value,
                                  }))
                                }
                                className="form-control form-control-sm"
                                style={{ width: 90 }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    saveInline(f.id);
                                  if (e.key === "Escape")
                                    cancelEdit(f.id);
                                }}
                              />
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => saveInline(f.id)}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => cancelEdit(f.id)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div
                              onDoubleClick={() =>
                                startEdit(f.id, f.stock)
                              }
                              style={{
                                cursor: "pointer",
                                fontWeight: 700,
                              }}
                            >
                              {f.stock}
                            </div>
                          )}
                        </td>

                        <td>{f.lowStockThreshold ?? 5}</td>

                        <td>{f.orderCount || 0}</td>

                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                startEdit(f.id, f.stock)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => {
                                const el = document.querySelector(
                                  `[data-food-id="${f.id}"]`
                                );

                                if (el) {
                                  el.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });

                                  // highlight animation
                                  el.classList.add("locate-highlight");
                                  setTimeout(
                                    () =>
                                      el.classList.remove(
                                        "locate-highlight"
                                      ),
                                    1200
                                  );
                                }
                              }}
                            >
                              Locate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {lowStockRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center p-4 text-muted"
                        >
                          All items healthy — no low/out-of-stock
                          items.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
