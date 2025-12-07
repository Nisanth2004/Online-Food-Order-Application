// src/pages/Orders.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PartnerContext } from "../context/PartnerContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  Search,
  Info,
  RefreshCw,
  Calendar,
  ChevronDown,
  X,
  Clock,
} from "lucide-react";

/**
 * Orders page with Option 3 (presets + custom date range in dropdown)
 */
export default function Orders() {
  const { partnerName } = useContext(PartnerContext);
  const navigate = useNavigate();

  // data + loading
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // search + filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  // date dropdown state
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // date picker fields (strings YYYY-MM-DD)
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [activePreset, setActivePreset] = useState("ALL"); // ALL or PRESET key or CUSTOM

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // refs for outside-click close
  const dateRef = useRef(null);
  const statusRef = useRef(null);

  // load (manual refresh too)
  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/orders/all");
      const all = res.data || [];
      const assigned = partnerName ? all.filter((o) => o.courierName === partnerName) : [];
      setOrders(assigned);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setPage(1);
    }
  };

  useEffect(() => {
    load();
    // no auto-refresh by default — user wanted manual refresh
    // cleanup not necessary
  }, [partnerName]);

  // Outside click close handlers
  useEffect(() => {
    function onDocClick(e) {
      if (dateRef.current && !dateRef.current.contains(e.target)) setDateDropdownOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusDropdownOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // date preset helpers
  const todayStr = () => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  };
  const yesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  };
  const startOfNDaysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1));
    return d.toISOString().slice(0, 10);
  };
  const startOfMonth = () => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  };

  const applyPreset = (key) => {
    setActivePreset(key);
    setPage(1);

    if (key === "ALL") {
      setDateStart("");
      setDateEnd("");
    } else if (key === "TODAY") {
      setDateStart(todayStr());
      setDateEnd(todayStr());
    } else if (key === "YESTERDAY") {
      setDateStart(yesterdayStr());
      setDateEnd(yesterdayStr());
    } else if (key === "LAST_7") {
      setDateStart(startOfNDaysAgo(7));
      setDateEnd(todayStr());
    } else if (key === "THIS_MONTH") {
      setDateStart(startOfMonth());
      setDateEnd(todayStr());
    } else if (key === "CUSTOM") {
      // leave dateStart/dateEnd as-is (user will pick)
    }
    setDateDropdownOpen(false);
  };

  // filtered + sorted
  const filtered = useMemo(() => {
    let f = [...orders];

    if (search) {
      const q = search.trim().toLowerCase();
      f = f.filter(
        (o) =>
          (o.phoneNumber && o.phoneNumber.toString().includes(q)) ||
          (o.id && o.id.toString().toLowerCase().includes(q))
      );
    }

    if (status !== "ALL") {
      f = f.filter((o) => o.orderStatus === status);
    }

    if (dateStart) {
      const s = new Date(dateStart + "T00:00:00");
      f = f.filter((o) => new Date(o.createdDate) >= s);
    }
    if (dateEnd) {
      const e = new Date(dateEnd + "T23:59:59");
      f = f.filter((o) => new Date(o.createdDate) <= e);
    }

    return f.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  }, [orders, search, status, dateStart, dateEnd]);

  // pagination values
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  // helpers
  const formatStatus = (s) => (s ? s.replace(/_/g, " ") : "");
  const formatDateTime = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // status color map
  const statusColors = {
    ORDER_PLACED: "bg-gray-100 text-gray-700",
    ORDER_CONFIRMED: "bg-blue-100 text-blue-700",
    ORDER_PACKED: "bg-yellow-100 text-yellow-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCEL_REQUESTED: "bg-orange-100 text-orange-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Assigned Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Orders assigned to you — filter, search & navigate.</p>
        </div>

        {/* Actions: Search + Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by order ID or phone..."
              className="w-80 h-10 pl-3 pr-10 rounded-lg border border-slate-200 bg-white text-sm placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
            />
            <Search className="absolute right-3 top-2.5 text-slate-400 w-4 h-4" />
          </div>

          <button
            onClick={load}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm hover:shadow-md text-sm text-slate-700"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Controls: Status + Date range */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Status dropdown */}
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => { setStatusDropdownOpen((s) => !s); setDateDropdownOpen(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md text-sm"
            aria-expanded={statusDropdownOpen}
            aria-haspopup="listbox"
          >
            <span className="text-slate-700">{status === "ALL" ? "All statuses" : formatStatus(status)}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {statusDropdownOpen && (
            <div className="absolute mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-40">
              <ul className="p-2 text-sm">
                <li>
                  <button
                    onClick={() => { setStatus("ALL"); setStatusDropdownOpen(false); setPage(1); }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-50"
                  >
                    All statuses
                  </button>
                </li>
                {[
                  "ORDER_PLACED",
                  "ORDER_CONFIRMED",
                  "ORDER_PACKED",
                  "SHIPPED",
                  "OUT_FOR_DELIVERY",
                  "DELIVERED",
                  "CANCEL_REQUESTED",
                  "CANCELLED",
                ].map((s) => (
                  <li key={s}>
                    <button
                      onClick={() => { setStatus(s); setStatusDropdownOpen(false); setPage(1); }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span>{formatStatus(s)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[s] ?? "bg-gray-100 text-gray-700"}`}>{s.includes("_") ? " " : ""}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Date range dropdown */}
        <div className="relative" ref={dateRef}>
          <button
            onClick={() => { setDateDropdownOpen((d) => !d); setStatusDropdownOpen(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md text-sm"
            aria-expanded={dateDropdownOpen}
          >
            <Calendar className="w-4 h-4 text-indigo-500" />
            <div className="text-sm text-slate-700">
              {activePreset === "ALL" ? "Any date" : activePreset === "CUSTOM" ? `${dateStart || "Start"} — ${dateEnd || "End"}` : activePreset}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {dateDropdownOpen && (
            <div className="absolute mt-2 w-[360px] bg-white border border-slate-200 rounded-lg shadow-lg z-40">
              <div className="p-4">
                {/* quick presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { key: "ALL", label: "All" },
                    { key: "TODAY", label: "Today" },
                    { key: "YESTERDAY", label: "Yesterday" },
                    { key: "LAST_7", label: "Last 7 days" },
                    { key: "THIS_MONTH", label: "This month" },
                    { key: "CUSTOM", label: "Custom" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      onClick={() => applyPreset(p.key)}
                      className={`px-3 py-1 rounded-md text-sm border ${activePreset === p.key ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200"} shadow-sm`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* custom inputs appear when activePreset === 'CUSTOM' */}
                <div className="border-t pt-3">
                  <div className="text-sm text-slate-600 mb-2">Custom range</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500">Start</label>
                      <input
                        type="date"
                        value={dateStart}
                        onChange={(e) => { setDateStart(e.target.value); setActivePreset("CUSTOM"); }}
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">End</label>
                      <input
                        type="date"
                        value={dateEnd}
                        onChange={(e) => { setDateEnd(e.target.value); setActivePreset("CUSTOM"); }}
                        className="mt-1 w-full px-3 py-2 border border-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => { setDateStart(""); setDateEnd(""); setActivePreset("ALL"); setDateDropdownOpen(false); setPage(1); }}
                      className="px-3 py-1 text-sm rounded border border-slate-200"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => { setActivePreset("CUSTOM"); setDateDropdownOpen(false); setPage(1); }}
                      className="px-4 py-1 bg-indigo-600 text-white rounded text-sm shadow-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Page size & info */}
        <div className="text-sm text-slate-500">
          Showing <strong>{filtered.length}</strong> results
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-sm text-slate-600 px-6 py-4 text-left">Order ID</th>
                <th className="text-sm text-slate-600 px-6 py-4 text-left">Phone</th>
                <th className="text-sm text-slate-600 px-6 py-4 text-left">Amount</th>
                <th className="text-sm text-slate-600 px-6 py-4 text-left">Status</th>
                <th className="text-sm text-slate-600 px-6 py-4 text-left">Date</th>
                <th className="text-sm text-slate-600 px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">Loading…</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">No orders found.</td></tr>
              ) : (
                pageData.map((o, idx) => (
                  <tr key={o.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 font-medium text-slate-800">{o.id}</td>
                    <td className="px-6 py-4 text-slate-600">{o.phoneNumber}</td>
                    <td className="px-6 py-4 text-slate-700">₹{Number(o.amount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[o.orderStatus] ?? "bg-gray-100 text-gray-700"}`}>
                        {formatStatus(o.orderStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{formatDateTime(o.createdDate)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/order/${o.id}`)}
                        title="View full details"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-shadow shadow-sm"
                      >
                        <Info className="w-4 h-4" />
                        <span className="text-sm hidden md:inline">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
          <div className="text-sm text-slate-600">
            Showing <strong>{(page - 1) * pageSize + 1}</strong> - <strong>{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1 rounded disabled:opacity-50 bg-white border border-slate-200 text-sm"
            >
              {"<<"}
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded disabled:opacity-50 bg-white border border-slate-200 text-sm"
            >
              Prev
            </button>

            {/* page numbers: show a compact window */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // show first, last, current +/- 2
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 2 && pageNum <= page + 2)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded text-sm ${pageNum === page ? "bg-indigo-600 text-white" : "bg-white border border-slate-200"}`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                // condensed ellipsis
                const shouldShowLeftEllipsis = page > 4 && i === 1;
                const shouldShowRightEllipsis = page < totalPages - 3 && i === totalPages - 2;
                if (shouldShowLeftEllipsis || shouldShowRightEllipsis) {
                  return <span key={`dots-${i}`} className="px-2 text-sm text-slate-400">…</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded disabled:opacity-50 bg-white border border-slate-200 text-sm"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded disabled:opacity-50 bg-white border border-slate-200 text-sm"
            >
              {">>"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
