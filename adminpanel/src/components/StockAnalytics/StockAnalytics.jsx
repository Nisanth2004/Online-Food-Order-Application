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

import {
  getMonthlySales,
  getMonthlyStockHistory,
  getTopSellingFoods,
  getLowStockFoods
} from "../../services/AnalyticsService";


import "./StockAnalytics.css"

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
  const [topSelling, setTopSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const loadAnalytics = async () => {
    try {
      setSales(await getMonthlySales());
      setHistory(await getMonthlyStockHistory());
      setTopSelling(await getTopSellingFoods());
      setLowStock(await getLowStockFoods());
    } catch (e) {
      console.error("Analytics load failed:", e);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
  <div className="analytics-wrapper">

  {/* Header */}
  <div className="mb-4">
    <h2 className="fw-bold d-flex align-items-center gap-2">
      <span role="img" aria-label="chart">📊</span>
      Stock & Sales Analytics
    </h2>
    <p className="text-muted" style={{ marginTop: "-5px" }}>
      Monthly sales and stock movement overview
    </p>
  </div>

  {/* CHARTS */}
  <div className="row g-4">

    {/* SALES */}
    <div className="col-md-6">
      <div className="premium-card">
        <div className="section-header">
          <span className="icon">📈</span>
          <h6>Monthly Sales</h6>
        </div>
        <Line
          data={{
            labels: sales.map(s => "M" + s.month),
            datasets: [
              {
                label: "Sales (₹)",
                data: sales.map(s => s.total),
                borderColor: "#4e73df",
                borderWidth: 2,
                tension: 0.35,
                pointRadius: 4,
                pointBackgroundColor: "#4e73df"
              }
            ]
          }}
        />
      </div>
    </div>

    {/* STOCK MOVEMENT */}
    <div className="col-md-6">
      <div className="premium-card">
        <div className="section-header">
          <span className="icon">📦</span>
          <h6>Stock Movement (Monthly)</h6>
        </div>
        <Bar
          data={{
            labels: history.map(h => "M" + h.month),
            datasets: [
              {
                label: "Stock Units Updated",
                data: history.map(h => h.units),
                backgroundColor: "#00bcd4",
                borderRadius: 8
              }
            ]
          }}
        />
      </div>
    </div>

  </div>

  {/* TOP SELLING */}
  <div className="premium-card mt-4">
    <div className="section-header">
      <span className="icon">🔥</span>
      <h5>Top Selling Foods</h5>
    </div>

    <table className="table premium-table">
      <tbody>
        {topSelling.map((item, i) => (
          <tr key={i}>
            <td className="food-name">{item?._id?.name}</td>
            <td className="text-end">
              <span className="tag tag-green">{item.totalQty} sold</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* LOW STOCK */}
  <div className="premium-card mt-4 mb-5">
    <div className="section-header">
      <span className="icon text-danger">⚠️</span>
      <h5>Low Stock Items</h5>
    </div>

    <table className="table premium-table">
      <tbody>
        {lowStock.map((item, i) => (
          <tr key={i}>
            <td className="food-name">{item.name}</td>
            <td className="text-end">
              <span className="tag tag-red">{item.stock} left</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

</div>

  );
};

export default StockAnalytics;
