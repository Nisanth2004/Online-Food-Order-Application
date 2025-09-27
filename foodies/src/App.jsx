import React, { useContext } from 'react'
import Menubar from './components/Menubar'
import {  Route, Routes } from 'react-router-dom'
import Home from './Pages/Home/Home'
import ContactUs from './Pages/Contact/Contact'
import ExploreFood from './Pages/ExploreFood/ExploreFood'
import FoodDetails from './Pages/FoodDetails/FoodDetails'
import Cart from './Pages/Cart/Cart'
import PlaceOrder from './Pages/PlaceOrder/PlaceOrder'
import Login from './components/Login/Login'
import Register from './components/Register/Register'
import "@fortawesome/fontawesome-free/css/all.min.css";


import { ToastContainer } from 'react-toastify';
import MyOrders from './Pages/MyOrders/MyOrders'
import { StoreContext } from './Context/StoreContext'
import Footer from './components/Footer/Footer'


const App = () => {

  const {token}=useContext(StoreContext);
  return (
    <div>
       
        <Menubar/>
        <ToastContainer/>
        
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/contact' element={<ContactUs/>}/>
          <Route path='/explore' element={<ExploreFood/>}/>
          <Route path='/food/:id' element={<FoodDetails/>}/>
          <Route path='/cart' element={<Cart/>}/>
          <Route path='/order' element={token?<PlaceOrder/>:<Login/>}/>
          <Route path='/login' element={token?<Home/>:<Login/>}/>
          <Route path='/register' element={token?<Home/>:<Register/>}/>
          <Route path='/myorders' element={token?<MyOrders/>:<Login/>}/>


        </Routes>
        <Footer/>



  
 
 
     
    </div>
  )
}

export default App
