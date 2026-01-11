import React, { useState } from "react";
import axios from "axios";
import api from "../api/api";

const VendorDashboard = () => {
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    companyName: "",
    brandName: "",
    contactPerson: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [kyc, setKyc] = useState({
    gstNumber: "",
    panNumber: "",
    businessType: "PROPRIETOR",
    bankAccountName: "",
    bankAccountNumber: "",
    ifscCode: "",
      gstFile: null,
  panFile: null,
  });

  /* ================= LOGOUT ================= */
 const logout = () => {
  localStorage.clear();
  window.location.href = "/vendor/login";
};



  /* ================= PROFILE SUBMIT ================= */
const submitProfile = async () => {
  if (!token) {
    alert("Please login again");
    return;
  }

  await api.put("/api/vendor/profile", profile);


  alert("Profile saved");
};

  /* ================= KYC SUBMIT ================= */
const submitKyc = async () => {
  const formData = new FormData();

  formData.append(
    "data",
    new Blob([JSON.stringify({
      gstNumber: kyc.gstNumber,
      panNumber: kyc.panNumber,
      businessType: kyc.businessType,
      bankAccountName: kyc.bankAccountName,
      bankName: kyc.bankName,
      bankAccountNumber: kyc.bankAccountNumber,
      ifscCode: kyc.ifscCode,
    })], { type: "application/json" })
  );

  formData.append("gstFile", kyc.gstFile);
  formData.append("panFile", kyc.panFile);
await api.post("/api/vendor/kyc", formData);



  alert("KYC submitted");
};


  /* ================= FILE UPLOAD (MOCK) ================= */


  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Vendor Dashboard</h3>
        <button className="btn btn-danger" onClick={logout}>Logout</button>
      </div>

      {/* TABS */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "profile" && "active"}`}
            onClick={() => setActiveTab("profile")}
          >
            Business Profile
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "kyc" && "active"}`}
            onClick={() => setActiveTab("kyc")}
          >
            KYC & Bank
          </button>
        </li>
      </ul>

      {/* ================= PROFILE TAB ================= */}
      {activeTab === "profile" && (
        <div className="card p-4 shadow-sm">
          <h5 className="mb-3">Business & Address</h5>

          {Object.keys(profile).map((key) => (
            <div className="mb-3" key={key}>
              <label className="form-label text-capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                className="form-control"
                value={profile[key]}
                onChange={(e) =>
                  setProfile({ ...profile, [key]: e.target.value })
                }
              />
            </div>
          ))}

          <button className="btn btn-primary" onClick={submitProfile}>
            Save Profile
          </button>
        </div>
      )}

      {/* ================= KYC TAB ================= */}
      {activeTab === "kyc" && (
        <div className="card p-4 shadow-sm">
          <h5 className="mb-3">Legal & Bank Details</h5>

          <input
            className="form-control mb-3"
            placeholder="GST Number"
            value={kyc.gstNumber}
            onChange={(e) => setKyc({ ...kyc, gstNumber: e.target.value })}
          />

          <input
            className="form-control mb-3"
            placeholder="PAN Number"
            value={kyc.panNumber}
            onChange={(e) => setKyc({ ...kyc, panNumber: e.target.value })}
          />

          <select
            className="form-select mb-3"
            value={kyc.businessType}
            onChange={(e) => setKyc({ ...kyc, businessType: e.target.value })}
          >
            <option>PROPRIETOR</option>
            <option>LLP</option>
            <option>PVT_LTD</option>
          </select>

          <input
            className="form-control mb-3"
            placeholder="Bank Account Name"
            onChange={(e) => setKyc({ ...kyc, bankAccountName: e.target.value })}
          />

          <input
            className="form-control mb-3"
            placeholder="Bank Account Number"
            onChange={(e) =>
              setKyc({ ...kyc, bankAccountNumber: e.target.value })
            }
          />
           <input
            className="form-control mb-3"
            placeholder="Bank  Name"
            onChange={(e) =>
              setKyc({ ...kyc, bankName: e.target.value })
            }
          />

          <input
            className="form-control mb-3"
            placeholder="IFSC Code"
            onChange={(e) => setKyc({ ...kyc, ifscCode: e.target.value })}
          />

          {/* FILE UPLOAD */}
          <div className="mb-3">
            <label>GST Certificate (PDF)</label>
           <input
  type="file"
  accept="application/pdf"
  className="form-control"
  onChange={(e) =>
    setKyc({ ...kyc, gstFile: e.target.files[0] })
  }
/>
          </div>

          <div className="mb-3">
            <label>PAN Card (PDF)</label>
           <input
  type="file"
  accept="application/pdf"
  className="form-control"
  onChange={(e) =>
    setKyc({ ...kyc, panFile: e.target.files[0] })
  }
/>
          </div>

          <button className="btn btn-success" onClick={submitKyc}>
            Submit KYC
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
