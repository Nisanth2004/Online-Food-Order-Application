// src/pages/Customers/Customers.jsx
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import "./Customers.css";
import { assets } from "../../assets/assets";

// ✅ use your global axios instance
import api from "../../services/CustomAxiosInstance";

const fileUrl = "/mnt/data/1296c9f8-bfee-4238-83fb-decf9a43d322.png";

const parseAddressParts = (address = "") => {
  if (!address) return [];
  const parts = address.includes("\n")
    ? address.split("\n").map((p) => p.trim()).filter(Boolean)
    : address.split(",").map((p) => p.trim()).filter(Boolean);
  return parts;
};

const Customers = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterPincode, setFilterPincode] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 🚀 Fetch all orders using axios instance
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders/all");
        setOrders(res.data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Build unique customers from orders
  const customers = useMemo(() => {
    const map = new Map();

    orders.forEach((order) => {
      const key =
        order.userId ||
        order.email ||
        order.phoneNumber ||
        `${order.phoneNumber}_${order.email}`;

      if (!map.has(key)) {
        const parts = parseAddressParts(order.userAddress || "");
        const city = parts[parts.length - 2] || "";
        const pincode = parts[parts.length - 1] || "";

        map.set(key, {
          key,
          userId: order.userId || "",
          name: order.userName || parts[0] || "Unknown",
          phone: order.phoneNumber || "-",
          email: order.email || "-",
          address: order.userAddress || "-",
          addressParts: parts,
          city: (order.city || city || "").trim(),
          pincode: (order.pincode || pincode || "").trim(),
          orderCount: 1,
          orders: [order],
        });
      } else {
        const entry = map.get(key);
        entry.orderCount++;
        entry.orders.push(order);

        if ((!entry.city || entry.city === "") && order.city) {
          entry.city = order.city.trim();
        }
        if ((!entry.pincode || entry.pincode === "") && order.pincode) {
          entry.pincode = order.pincode.trim();
        }
      }
    });

    return Array.from(map.values());
  }, [orders]);

  // Filters
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return customers.filter((c) => {
      if (filterCity && c.city.toLowerCase() !== filterCity.toLowerCase())
        return false;
      if (filterPincode && c.pincode !== filterPincode) return false;

      if (!term) return true;

      const hay = `${c.name} ${c.phone} ${c.email} ${c.address} ${c.city} ${c.pincode}`.toLowerCase();
      return hay.includes(term);
    });
  }, [customers, searchTerm, filterCity, filterPincode]);

  // Sorting
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "name_asc":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        arr.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "orders_desc":
        arr.sort((a, b) => b.orderCount - a.orderCount);
        break;
      case "orders_asc":
        arr.sort((a, b) => a.orderCount - b.orderCount);
        break;
      default:
        break;
    }
    return arr;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  // Excel export
  const exportToExcel = () => {
    const rows = sorted.map((c) => ({
      Name: c.name,
      Phone: c.phone,
      Email: c.email,
      City: c.city,
      Pincode: c.pincode,
      "Order Count": c.orderCount,
      Address: c.address,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `customers_${new Date().toISOString()}.xlsx`);
  };

  const gotoCustomerOrders = (customer) => {
    if (customer.userId) {
      navigate(`/orders?userId=${customer.userId}`);
    } else {
      navigate(`/orders?phone=${customer.phone}`);
    }
  };

  const changePage = (p) => {
    const next = Math.max(1, Math.min(totalPages, p));
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h4>Loading customers...</h4>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-3 gap-3">
        <img
          src={assets.main_logo}
          alt="logo"
          style={{
            width: 48,
            height: 48,
            objectFit: "cover",
            borderRadius: 6,
          }}
        />
        <h3 className="m-0">Customer Directory</h3>

        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={exportToExcel}>
            Download Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <input
          placeholder="Search name / phone / email / address"
          className="form-control"
          style={{ minWidth: 240 }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />

        <input
          placeholder="City"
          className="form-control"
          style={{ width: 160 }}
          value={filterCity}
          onChange={(e) => {
            setFilterCity(e.target.value);
            setPage(1);
          }}
        />

        <input
          placeholder="Pincode"
          className="form-control"
          style={{ width: 120 }}
          value={filterPincode}
          onChange={(e) => {
            setFilterPincode(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="form-control"
          style={{ width: 200 }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name_asc">Sort: Name A → Z</option>
          <option value="name_desc">Sort: Name Z → A</option>
          <option value="orders_desc">Sort: Most Orders → Least</option>
          <option value="orders_asc">Sort: Least Orders → Most</option>
        </select>

        <select
          className="form-control"
          style={{ width: 120 }}
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value));
            setPage(1);
          }}
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>

        <button
          className="btn btn-secondary"
          onClick={() => {
            setSearchTerm("");
            setFilterCity("");
            setFilterPincode("");
            setSortBy("name_asc");
            setPage(1);
          }}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="card p-2">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Pincode</th>
                <th>Order Count</th>
                <th>Address</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {paginated.length ? (
                paginated.map((c) => (
                  <tr key={c.key}>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.email}</td>
                    <td>{c.city || "-"}</td>
                    <td>{c.pincode || "-"}</td>
                    <td>
                      <span className="badge bg-primary">{c.orderCount}</span>
                    </td>
                    <td style={{ whiteSpace: "pre-line", maxWidth: 380 }}>
                      {c.address}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => gotoCustomerOrders(c)}
                        >
                          View Orders
                        </button>

                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            const rows = c.orders.map((o) => ({
                              OrderID: o.id,
                              Date: o.createdDate,
                              Amount: o.amount,
                              Status: o.orderStatus,
                              Items: (o.orderedItems || [])
                                .map((it) => `${it.name} x${it.quantity}`)
                                .join(", "),
                            }));

                            const ws = XLSX.utils.json_to_sheet(rows);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, "Orders");

                            const buf = XLSX.write(wb, {
                              bookType: "xlsx",
                              type: "array",
                            });

                            saveAs(
                              new Blob([buf]),
                              `customer_${c.name || c.phone}_${
                                new Date().toISOString()
                              }.xlsx`
                            );
                          }}
                        >
                          Export Orders
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Showing{" "}
          {Math.min((page - 1) * pageSize + 1, sorted.length || 0)} -{" "}
          {Math.min(page * pageSize, sorted.length || 0)} of{" "}
          {sorted.length} customers
        </div>

        <div className="btn-group">
          <button
            className="btn btn-outline-primary"
            disabled={page === 1}
            onClick={() => changePage(1)}
          >
            First
          </button>
          <button
            className="btn btn-outline-primary"
            disabled={page === 1}
            onClick={() => changePage(page - 1)}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            if (p < page - 3 || p > page + 3) return null;

            return (
              <button
                key={p}
                className={`btn ${
                  p === page ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => changePage(p)}
              >
                {p}
              </button>
            );
          })}

          <button
            className="btn btn-outline-primary"
            disabled={page === totalPages}
            onClick={() => changePage(page + 1)}
          >
            Next
          </button>
          <button
            className="btn btn-outline-primary"
            disabled={page === totalPages}
            onClick={() => changePage(totalPages)}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customers;
