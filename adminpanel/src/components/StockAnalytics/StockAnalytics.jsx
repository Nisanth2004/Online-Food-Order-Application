import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";

import {

  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

import { getMonthlySales,getMonthlyStockHistory } from '../../services/AnalyticsService';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend
);

const StockAnalytics = () => {
  const [sales, setSales] = useState([]);
  const [history, setHistory] = useState([]);

  const loadAnalytics = async () => {
    try {
      const saleRes = await getMonthlySales();
      const historyRes = await getMonthlyStockHistory();

      const safeSales = Array.isArray(saleRes)
        ? saleRes
        : saleRes?.data || saleRes?.sales || [];

      const safeHistory = Array.isArray(historyRes)
        ? historyRes
        : historyRes?.data || historyRes?.history || [];

      setSales(safeSales);
      setHistory(safeHistory);

    } catch (e) {
      console.error("Analytics load failed:", e);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="fw-bold">📊 Stock & Sales Analytics</h3>
      <p className="text-muted">Monthly sales and stock movement overview</p>

      <div className="row mt-3">
        {/* ---------------- Sales Chart ---------------- */}
        <div className="col-md-6 mb-3">
          <div className="card p-3 shadow-sm">
            <h6 className="fw-bold">Monthly Sales</h6>

            <Line
              data={{
                labels: sales.map(s => "M" + s.month),
                datasets: [
                  {
                    label: "Sales (₹)",
                    data: sales.map(s => s.total),
                    borderColor: "#4e73df",
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true } }
              }}
            />
          </div>
        </div>

        {/* ---------------- Stock History Chart ---------------- */}
        <div className="col-md-6 mb-3">
          <div className="card p-3 shadow-sm">
            <h6 className="fw-bold">Stock Movement (Monthly)</h6>

            <Bar
              data={{
                labels: history.map(h => "M" + h.month),
                datasets: [
                  {
                    label: "Stock Units Updated",
                    data: history.map(h => h.units),
                    backgroundColor: "#36b9cc"
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: true } }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAnalytics;
