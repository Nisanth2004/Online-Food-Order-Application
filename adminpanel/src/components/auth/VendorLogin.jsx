import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
import api from "../../services/CustomAxiosInstance";

const VendorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/login", {
        email,
        password,
      });
localStorage.setItem("token", res.data.token);
localStorage.setItem("role", "VENDOR");

      navigate("/vendor/dashboard");
    } catch (err) {
      alert("Invalid credentials or not approved by admin");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">
              <h4 className="text-center mb-3">Vendor Login</h4>

              <form onSubmit={handleLogin}>
                <input
                  className="form-control mb-3"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <input
                  className="form-control mb-3"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button className="btn btn-success w-100">
                  Login
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
