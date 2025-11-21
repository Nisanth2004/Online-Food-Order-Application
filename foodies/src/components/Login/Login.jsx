import React, { useContext, useState } from 'react'
import './Login.css'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../service/authService'
import { toast } from 'react-toastify'
import { StoreContext } from '../../Context/StoreContext';

const Login = () => {

  const { setToken, loadCartData } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: '',
    password: '',
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await login(data);
      if (response.status === 200) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        await loadCartData(response.data.token);
        navigate("/");
      } else {
        toast.error("Unable to login. Please try again.");
      }
    } catch (error) {
      console.log("unable to login:", error);
      toast.error("Unable to login. Please try again.");
    }
  };

  return (
    <div className="auth-login-container">
      <div className="auth-row">
        <div className="auth-card">
          <div className="auth-card-body">
            <h5 className="auth-title">Sign In</h5>

            <form onSubmit={onSubmitHandler}>
              <div className="auth-input-group">
                <input
                  type="email"
                  className="auth-input"
                  name="email"
                  onChange={onChangeHandler}
                  value={data.email}
                  placeholder="Email address"
                />
              </div>

              <div className="auth-input-group">
                <input
                  type="password"
                  className="auth-input"
                  name="password"
                  onChange={onChangeHandler}
                  value={data.password}
                  placeholder="Password"
                />
              </div>

              <div className="auth-btn-group">
                <button className="auth-btn auth-btn-primary" type="submit">
                  Sign in
                </button>

                <button className="auth-btn auth-btn-danger" type="reset">
                  Reset
                </button>
              </div>

              <div className="auth-link">
                Don’t have an account? <Link to="/register"><span className='sign-btn'>Sign up</span></Link>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
