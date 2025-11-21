import React, { useState } from 'react';
import './Register.css';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../../service/authService';

const Register = () => {
  const [data, setData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await registerUser(data);
      if (response.status === 201) {
        toast.success('Registration Completed! Please login.');
        navigate('/login');
      } else {
        toast.error('Unable to register. Please try again.');
      }
    } catch (error) {
      toast.error('Unable to register. Please try again.');
    }
  };

  return (
    <div className="regx-container">
      <div className="regx-inner">
        <div className="regx-card-wrapper">
          <div className="card regx-card">
            <div className="card-body regx-card-body">
              <h5 className="regx-title">Sign Up</h5>

              <form onSubmit={onSubmitHandler}>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control regx-input"
                    id="floatingName"
                    name="name"
                    onChange={onChangeHandler}
                    value={data.name}
                    placeholder="John Doe"
                    required
                  />
                  <label htmlFor="floatingName">Full Name</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control regx-input"
                    id="floatingInput"
                    name="email"
                    onChange={onChangeHandler}
                    value={data.email}
                    placeholder="name@example.com"
                    required
                  />
                  <label htmlFor="floatingInput">Email address</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control regx-input"
                    id="floatingPassword"
                    name="password"
                    onChange={onChangeHandler}
                    value={data.password}
                    placeholder="Password"
                    required
                  />
                  <label htmlFor="floatingPassword">Password</label>
                </div>

                <div className="d-grid">
                  <button className="btn btn-primary regx-btn" type="submit">
                    Sign up
                  </button>

                  <button className="btn btn-outline-danger regx-btn mt-2" type="reset">
                    Reset
                  </button>
                </div>

                <div className="regx-footer mt-4">
                  Already have an account? <Link to="/login"><span className='regx-link'>Sign in</span></Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
