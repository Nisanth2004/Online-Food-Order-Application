import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { toast } from "react-toastify";

const VendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVendor = async () => {
    try {
      const res = await api.get(`/api/admin/vendors/${vendorId}`);
      setVendor(res.data);
    } catch {
      toast.error("Failed to load vendor details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  const approveVendor = async () => {
    await api.put(`/api/admin/vendors/${vendorId}/approve`);
    toast.success("Vendor approved");
    fetchVendor();
  };

  const rejectVendor = async () => {
    await api.put(`/api/admin/vendors/${vendorId}/reject`);
    toast.success("Vendor rejected");
    fetchVendor();
  };

  if (loading) return <div className="p-4 text-muted">Loading...</div>;
  if (!vendor) return null;

  const statusBadge = (status) => {
    const map = {
      ACTIVE: "success",
      BLOCKED: "danger",
      DRAFT: "warning",
    };
    return <span className={`badge bg-${map[status]}`}>{status}</span>;
  };

  const kycBadge = (status) => {
    const map = {
      VERIFIED: "success",
      REJECTED: "danger",
      PENDING: "warning",
    };
    return <span className={`badge bg-${map[status]}`}>{status}</span>;
  };

  return (
    <div className="container mt-4">

      {/* BACK + ACTIONS */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div>
          <button className="btn btn-success me-2" onClick={approveVendor}>
            Approve
          </button>
          <button className="btn btn-danger" onClick={rejectVendor}>
            Reject
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Vendor Details</h4>
          {statusBadge(vendor.accountStatus)}
        </div>
      </div>

      {/* TIMELINE */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Progress</h5>

          <div className="progress" style={{ height: "30px" }}>
            <div
              className={`progress-bar bg-success`}
              style={{
                width:
                  vendor.accountStatus === "ACTIVE"
                    ? "100%"
                    : vendor.kyc
                    ? "66%"
                    : "33%",
              }}
            >
              {vendor.accountStatus === "ACTIVE"
                ? "Approved"
                : vendor.kyc
                ? "KYC Submitted"
                : "Registered"}
            </div>
          </div>

          <div className="d-flex justify-content-between mt-2 small text-muted">
            <span>Registered</span>
            <span>KYC</span>
            <span>Approved</span>
          </div>
        </div>
      </div>

      {/* BUSINESS + ADDRESS */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="mb-3">Business Info</h5>
              <Info label="Company" value={vendor.companyName} />
              <Info label="Brand" value={vendor.brandName} />
              <Info label="Contact Person" value={vendor.contactPerson} />
              <Info label="Phone" value={vendor.phone} />
              <Info label="Email" value={vendor.email} />
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="mb-3">Address</h5>
              <p className="text-muted">
                {vendor.addressLine1}, {vendor.addressLine2}<br />
                {vendor.city}, {vendor.state} - {vendor.pincode}<br />
                {vendor.country}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KYC */}
      {vendor.kyc && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <h5>KYC Details</h5>
              {kycBadge(vendor.kyc.kycStatus)}
            </div>

            <div className="row">
              <div className="col-md-6">
                <Info label="GST Number" value={vendor.kyc.gstNumber} />
                <Info label="PAN Number" value={vendor.kyc.panNumber} />
                <Info label="Business Type" value={vendor.kyc.businessType} />
              </div>
            </div>

            <hr />

            <h6>Documents</h6>
            <a
              href={vendor.kyc.gstCertificateUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-primary me-2"
            >
              📄 Download GST
            </a>

            <a
              href={vendor.kyc.panCardUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-primary"
            >
              📄 Download PAN
            </a>
          </div>
        </div>
      )}

      {/* BANK */}
      {vendor.kyc && (
        <div className="card mb-5 shadow-sm">
          <div className="card-body">
            <h5 className="mb-3">Bank Details</h5>
            <div className="row">
              <div className="col-md-6">
                <Info label="Account Name" value={vendor.kyc.bankAccountName} />
                <Info label="Account Number" value={vendor.kyc.bankAccountNumber} />
              </div>
              <div className="col-md-6">
                <Info label="IFSC Code" value={vendor.kyc.ifscCode} />
                <Info label="Bank Name" value={vendor.kyc.bankName} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const Info = ({ label, value }) => (
  <p className="mb-2">
    <strong>{label}:</strong>{" "}
    <span className="text-muted">{value || "-"}</span>
  </p>
);

export default VendorDetails;
