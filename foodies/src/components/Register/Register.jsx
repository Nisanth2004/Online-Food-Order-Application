import React, { useState } from 'react'
import './Register.css'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import axios from 'axios';
import { registerUser } from '../../service/authService';
const Register = () => {


  const[data,setData]=useState({
    name:'',
    email:'',
    password:''
  })

  const navigate=useNavigate();

  // handler function
  const onChangeHandler=(event)=>{
    const name=event.target.name;
    const value=event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  // onSubmit Handler function
  const onSubmitHandler=async (event)=>{
    event.preventDefault();
    console.log(data);
    try {
   const response= await registerUser(data);
  
     if(response.status===201)
     {
      toast.success("Registeration Completed,Please login.")
      navigate ('/login')
     }else{
      toast.error('Unable to register,Please try again')
     }
     
      
    } catch (error) {
      toast.error('Unable to register,please try again')
      
    }

  }
  return (
    <div className="register-container">
    <div className="row">
      <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
        <div className="card border-0 shadow rounded-3 my-5">
          <div className="card-body p-4 p-sm-5">
            <h5 className="card-title text-center mb-5 fw-light fs-5">Sign Up</h5>
            <form onSubmit={onSubmitHandler}>
            <div className="form-floating mb-3">
                <input type="text" className="form-control" id="floatingName" name="name" onChange={onChangeHandler} value={data.name} placeholder="John Doe" required/>
                <label htmlFor="floatingName">Full Name</label>
              </div>
              <div className="form-floating mb-3">
                <input type="email" className="form-control" id="floatingInput"  name="email" onChange={onChangeHandler} value={data.email} placeholder="name@example.com" required/>
                <label htmlFor="floatingInput">Email address</label>
              </div>
              <div className="form-floating mb-3">
                <input type="password" className="form-control" name="password" onChange={onChangeHandler} value={data.password} id="floatingPassword" placeholder="Password" required/>
                <label htmlFor="floatingPassword">Password</label>
              </div>

             
              <div className="d-grid">
                <button className="btn btn-outline-primary btn-login text-uppercase " type="submit">Sign
                  up</button>

                  <button className="btn btn-outline-danger btn-login text-uppercase mt-2 " type="reset">Reset
                  </button>
              </div>
              <div className="mt-4">
                Already have an account? <Link to='/login'>Sign in</Link>
              </div>
              
           
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Register
