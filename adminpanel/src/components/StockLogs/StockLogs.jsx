import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getStockLogs } from "../../services/FoodService";
import "./StockLogs.css";

/**
 * Fallback image (user-uploaded). The runtime will transform the sandbox path to a usable url.
 * Path provided per request: sandbox:/mnt/data/41cf85f3-aa5d-49d0-bce6-f7e070744007.png
 */
const FALLBACK_IMAGE = "https://via.placeholder.com/60";


const StockLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // increase, decrease, all
  const [userFilter, setUserFilter] = useState("all"); // admin / system / customer
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Tabs
  const [tab, setTab] = useState("table");

  // Pagination (table)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const resp = await getStockLogs();
      // Normalize & protect against nulls
      const cleaned = (resp || []).map((l) => ({
        id: l.id || `${Math.random().toString(36).slice(2, 9)}`,
        foodName: l.foodName || "Unknown",
        change: Number(l.change || 0),
        oldStock: Number(l.oldStock ?? 0),
        newStock: Number(l.newStock ?? 0),
        updatedBy: (l.updatedBy || "admin").toString(),
        timestamp: l.timestamp || new Date().toISOString(),
        image: l.image || FALLBACK_IMAGE,
      }));

      // Sort newest first
      cleaned.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setLogs(cleaned);
      setFiltered(cleaned);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load stock logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Filtering logic
  useEffect(() => {
    let data = [...logs];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (l) =>
          l.foodName.toLowerCase().includes(q) ||
          l.updatedBy.toLowerCase().includes(q) ||
          `${l.oldStock}`.includes(q) ||
          `${l.newStock}`.includes(q)
      );
    }

    if (typeFilter !== "all") {
      data = data.filter((l) => (typeFilter === "increase" ? l.change > 0 : l.change < 0));
    }

    if (userFilter !== "all") {
      // match normalized strings ('admin','system','customer')
      data = data.filter((l) => l.updatedBy.toLowerCase() === userFilter);
    }

    if (dateFrom) {
      data = data.filter((l) => new Date(l.timestamp) >= new Date(dateFrom));
    }

    if (dateTo) {
      data = data.filter((l) => new Date(l.timestamp) <= new Date(dateTo + " 23:59:59"));
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [search, typeFilter, userFilter, dateFrom, dateTo, logs]);

  // EXPORT TO EXCEL
  const exportExcel = () => {
    import("xlsx").then((xlsx) => {
      const sheetData = filtered.map((log) => ({
        Food: log.foodName,
        Change: log.change,
        "Old Stock": log.oldStock,
        "New Stock": log.newStock,
        "Updated By": getDisplayUpdatedBy(log.updatedBy),
        Time: new Date(log.timestamp).toLocaleString(),
      }));

      const worksheet = xlsx.utils.json_to_sheet(sheetData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Stock Logs");
      xlsx.writeFile(workbook, "StockLogs.xlsx");
    });
  };

  // EXPORT TO PDF
  const exportPDF = async () => {
  const jsPDFModule = await import("jspdf");
  const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

  // Create jsPDF instance first
  const doc = new jsPDF();

  // Load autotable and attach to *this* doc instance
  const autoTableModule = await import("jspdf-autotable");
  autoTableModule.default(doc);  // <-- Correct usage!!!

  doc.setFontSize(14);
  doc.text("Stock Logs Report", 14, 15);

  const tableData = filtered.map((log) => [
    log.foodName,
    log.change > 0 ? `+${log.change}` : `${log.change}`,
    `${log.oldStock} → ${log.newStock}`,
    getDisplayUpdatedBy(log.updatedBy),
    new Date(log.timestamp).toLocaleString(),
  ]);

  doc.autoTable({
    head: [["Food", "Change", "Old → New", "User", "Time"]],
    body: tableData,
    startY: 25,
    styles: { fontSize: 10 },
  });

  doc.save("StockLogs.pdf");
};



  // Pagination
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const paginated = filtered.slice(firstIndex, lastIndex);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  // Map updatedBy to friendly text
  function getDisplayUpdatedBy(updatedByRaw) {
    const val = (updatedByRaw || "").toLowerCase();
    if (val === "system") return "Auto Restore";
    if (val === "admin") return "Admin";
    if (val === "user") return "Customer";
    return updatedByRaw;
  }

  // Badge class for change
  const changeBadgeClass = (change) => (change > 0 ? "badge-increase" : change < 0 ? "badge-decrease" : "badge-neutral");

  return (
    <div className="container mt-4 stocklogs-page">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <h3 className="fw-bold">Stock Logs</h3>
          <small className="text-muted">Track every stock update — "System" is shown as <strong>System (Auto Restore)</strong></small>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <button className="btn btn-sm btn-success" onClick={exportExcel}>Export Excel</button>

        </div>
      </div>

      {/* FILTER BAR */}
      <div className="card p-3 mt-3 shadow-sm filter-bar">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label small mb-1">Search</label>
            <input
              type="text"
              placeholder="Search food, user, value..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small mb-1">Change Type</label>
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="increase">Increased</option>
              <option value="decrease">Decreased</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small mb-1">Updated By</label>
            <select className="form-select" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="admin">Admin</option>
              <option value="system"> Auto Restore</option>
              <option value="user">Customer</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small mb-1">From</label>
            <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>

          <div className="col-md-2">
            <label className="form-label small mb-1">To</label>
            <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs mt-3">
        <button className={`tab-btn ${tab === "table" ? "active" : ""}`} onClick={() => setTab("table")}>Table View</button>
        <button className={`tab-btn ${tab === "timeline" ? "active" : ""}`} onClick={() => setTab("timeline")}>Timeline View</button>
      </div>

      {/* TABLE VIEW */}
      {tab === "table" && (
        <div className="card mt-3 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        
                        <th>Food</th>
                        <th style={{ minWidth: 120 }}>Change</th>
                        <th style={{ minWidth: 120 }}>Old → New</th>
                        <th style={{ minWidth: 160 }}>Updated By</th>
                        <th style={{ minWidth: 180 }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((log) => (
                        <tr key={log.id}>
                          

                          <td>
                            <div className="fw-semibold">{log.foodName}</div>
                          </td>

                          <td>
                            <span className={`badge ${changeBadgeClass(log.change)}`}>
                              {log.change > 0 ? `+${log.change}` : log.change}
                            </span>
                          </td>

                          <td>
                            {log.oldStock} → {log.newStock}
                          </td>

                          <td>
                            <span className="badge badge-role">{getDisplayUpdatedBy(log.updatedBy)}</span>
                          </td>

                          <td>
                            <span className="text-muted small">{new Date(log.timestamp).toLocaleString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="d-flex justify-content-between align-items-center p-3">
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-2" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}>Previous</button>
                    <button className="btn btn-sm btn-outline-primary" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}>Next</button>
                  </div>
                  <div className="text-muted small">Page {currentPage} of {totalPages}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TIMELINE VIEW */}
      {tab === "timeline" && (
        <div className="timeline mt-4">
          {filtered.length === 0 ? (
            <div className="text-center p-4 text-muted">No logs to show</div>
          ) : (
            filtered.map((log) => (
              <div className="timeline-item" key={log.id}>
                <div className="timeline-dot" />
                <div className="timeline-content shadow-sm">
                  <div className="d-flex align-items-start gap-3">
                   
                    <div style={{ flex: 1 }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{log.foodName}</h6>
                          <div className="small text-muted">Old: {log.oldStock} — New: {log.newStock}</div>
                        </div>

                        <div className="text-end">
                          <span className={`badge ${changeBadgeClass(log.change)}`}>
                            {log.change > 0 ? `+${log.change}` : log.change}
                          </span>
                          <div className="mt-1"><span className="badge badge-role">{getDisplayUpdatedBy(log.updatedBy)}</span></div>
                        </div>
                      </div>

                      <div className="mt-2 small text-muted">{new Date(log.timestamp).toLocaleString()}</div>
                      {log.note && <div className="mt-1 small text-muted">Note: {log.note}</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StockLogs;
