import { useEffect, useState } from "react";
import { getFlashSales, deleteFlashSale } from "../../../services/FlashSaleService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import BackHeader from "../../../components/BackHeader";
const FlashSaleList = () => {
  const [sales, setSales] = useState([]);

  const load = async () => {
    const res = await getFlashSales();
    setSales(res.data);
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

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-3">
       <BackHeader title="Flash Sales" />

        <Link to="/admin/offers/flash-sales/new" className="btn btn-danger">
          + New Flash Sale
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Food</th>
            <th>Sale Price</th>
            <th>Duration</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {sales.map(fs => {
            const now = new Date();
            const active =
              fs.active &&
              new Date(fs.startTime) < now &&
              new Date(fs.endTime) > now;

            return (
              <tr key={fs.id}>
                <td>{fs.foodId}</td>
                <td>₹{fs.salePrice}</td>
                <td>
                  {fs.startTime} → {fs.endTime}
                </td>
                <td>
                  {active ? (
                    <span className="badge bg-danger">LIVE</span>
                  ) : (
                    <span className="badge bg-secondary">Expired</span>
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
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FlashSaleList;
