import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";


const VendorList = () => {
  const [vendors, setVendors] = useState([]);
const navigate = useNavigate();
  const fetchVendors = async () => {
    try {
      const res = await api.get("/api/admin/vendors");
      setVendors(res.data);
    } catch {
      toast.error("Failed to fetch vendors");
    }
  };
  const viewDetails = (vendor) => {
  navigate(`/admin/vendors/${vendor.vendorId}`);
};

  useEffect(() => {
    fetchVendors();
  }, []);

  const updateStatus = async (accountId, action) => {
    try {
      await api.put(
        `/api/admin/vendors/${accountId}/status`,
        { action }
      );
      toast.success(`Vendor ${action.toLowerCase()}ed successfully`);
      fetchVendors();
    } catch {
      toast.error("Failed to update vendor status");
    }
  };



  return (
    <div className="container mt-4">
      <h3>Registered Vendors</h3>

      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Company</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {vendors.map((v, i) => (
            <tr key={v.id}>
              <td>{i + 1}</td>
              <td>{v.companyName}</td>
              <td>{v.email}</td>
              <td>{v.phone}</td>
              <td>
                <span className={`badge ${
                  v.status === "ACTIVE" ? "bg-success" :
                  v.status === "BLOCKED" ? "bg-danger" :
                  "bg-warning text-dark"
                }`}>
                  {v.status}
                </span>
              </td>
              <td>
                {v.status === "DRAFT" && (
                  <>
                    <button
                      className="btn btn-sm btn-success me-2"
                      onClick={() => updateStatus(v.accountId, "APPROVE")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger me-2"
                      onClick={() => updateStatus(v.accountId, "REJECT")}
                    >
                      Reject
                    </button>
                  </>
                )}
               <button
  className="btn btn-sm btn-primary"
  onClick={() => viewDetails(v)}
>
  View
</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VendorList;
