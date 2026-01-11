import React, { useState } from "react";
import api from "../../services/CustomAxiosInstance";


const VendorRegister = () => {
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/vendor/register", form);
      alert("Vendor registered successfully. Awaiting admin approval.");
      setForm({ companyName: "", email: "", password: "", phone: "" });
    } catch (err) {
      alert(err.response?.data || "Registration failed");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body">
              <h4 className="text-center mb-3">Vendor Registration</h4>

              <form onSubmit={handleSubmit}>
                <input
                  className="form-control mb-3"
                  name="companyName"
                  placeholder="Company Name"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />

                <input
                  className="form-control mb-3"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <input
                  className="form-control mb-3"
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <input
                  className="form-control mb-3"
                  name="phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />

                <button className="btn btn-primary w-100">
                  Register
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
