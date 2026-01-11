import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    const res = await api.post(
  "/api/access/admin/login",
  { email, password }
);

localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", "ADMIN");

    navigate("/admin");

  };

  return (
   <div className="container d-flex justify-content-center align-items-center vh-100">
  <div className="card shadow p-4" style={{ width: "400px" }}>
    <h3 className="text-center mb-3">Admin Login</h3>

    <input
      className="form-control mb-3"
      placeholder="Email"
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      type="password"
      className="form-control mb-3"
      placeholder="Password"
      onChange={(e) => setPassword(e.target.value)}
    />

    <button className="btn btn-dark w-100" onClick={login}>
      Login
    </button>

    <div className="text-center mt-3">
      <a href="/vendor/login">Vendor Login</a>
    </div>
  </div>
</div>

  );
};

export default Login;
