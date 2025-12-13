import { Link, useNavigate } from "react-router-dom";
import { FaBoxOpen, FaBolt, FaTags, FaBullhorn } from "react-icons/fa";
import "./OffersDashboard.css";

const OffersDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-outline-secondary me-3"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h2 className="mb-0">Offers & Promotions</h2>
      </div>

      <div className="row g-4">
        <DashboardCard
          title="Combos"
          description="Food bundles"
          icon={<FaBoxOpen />}
          to="/admin/offers/combos"
          color="primary"
        />

        <DashboardCard
          title="Flash Sales"
          description="Limited time offers"
          icon={<FaBolt />}
          to="/admin/offers/flash-sales"
          color="danger"
        />

        <DashboardCard
          title="Coupons"
          description="Discount codes"
          icon={<FaTags />}
          to="/admin/offers/coupons"
          color="success"
        />

        <DashboardCard
          title="Promotions"
          description="Festival banners"
          icon={<FaBullhorn />}
          to="/admin/offers/promotions"
          color="warning"
        />
      </div>
    </div>
  );
};

const DashboardCard = ({ title, description, icon, to, color }) => {
  return (
    <div className="col-md-3">
      <Link to={to} className={`offer-card border-${color}`}>
        <div className={`icon bg-${color}`}>
          {icon}
        </div>
        <h5>{title}</h5>
        <p>{description}</p>
      </Link>
    </div>
  );
};

export default OffersDashboard;
