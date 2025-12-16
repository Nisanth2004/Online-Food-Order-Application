import { useEffect, useState } from "react";
import {
  getFlashSales,
  deleteFlashSale
} from "../../../services/FlashSaleService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import BackHeader from "../../../components/BackHeader";

const FlashSaleList = () => {
  const [sales, setSales] = useState([]);

  const load = async () => {
    const res = await getFlashSales();
    setSales(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete flash sale?")) return;
    await deleteFlashSale(id);
    toast.success("Flash sale removed");
    load();
  };

  // ✅ Readable date-time formatter
  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <BackHeader title="Flash Sales" />

        <Link
          to="/admin/offers/flash-sales/new"
          className="btn btn-danger"
        >
          + New Flash Sale
        </Link>
      </div>

      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th>Food</th>
            <th>Sale Price</th>
            <th>Duration</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {sales.length ? (
            sales.map((fs) => {
              const now = new Date();
              const start = new Date(fs.startTime);
              const end = new Date(fs.endTime);

              const isLive =
                fs.active && start <= now && end >= now;

              const isUpcoming =
                fs.active && start > now;

              return (
                <tr key={fs.id}>
       <td>{fs.foodName}</td>


                  <td className="fw-semibold">
                    ₹{fs.salePrice}
                  </td>

                  <td>
                    <div className="small">
                      <div>
                        📅 <strong>Start:</strong>{" "}
                        {formatDateTime(fs.startTime)}
                      </div>
                      <div>
                        ⏰ <strong>End:</strong>{" "}
                        {formatDateTime(fs.endTime)}
                      </div>
                    </div>
                  </td>

                  <td>
                    {isLive ? (
                      <span className="badge bg-danger">
                        LIVE
                      </span>
                    ) : isUpcoming ? (
                      <span className="badge bg-warning text-dark">
                        Upcoming
                      </span>
                    ) : (
                      <span className="badge bg-secondary">
                        Expired
                      </span>
                    )}
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => remove(fs.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={5}
                className="text-center text-muted p-4"
              >
                No flash sales found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FlashSaleList;
