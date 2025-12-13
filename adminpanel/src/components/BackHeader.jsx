import { useNavigate } from "react-router-dom";

const BackHeader = ({ title, backTo = "/admin/offers" }) => {
  const navigate = useNavigate();

  return (
    <div className="d-flex align-items-center mb-4">
      <button
        className="btn btn-outline-secondary me-3"
        onClick={() => navigate(backTo)}
      >
        ← Back
      </button>
      <h3 className="mb-0">{title}</h3>
    </div>
  );
};

export default BackHeader;
