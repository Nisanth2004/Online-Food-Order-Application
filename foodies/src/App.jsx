import React from 'react'
import Menubar from './components/Menubar'
import {  Route, Routes } from 'react-router-dom'
import Home from './Pages/Home/Home'
import ContactUs from './Pages/Contact/Contact'
import ExploreFood from './Pages/ExploreFood/ExploreFood'
import FoodDetails from './Pages/FoodDetails/FoodDetails'
import Cart from './Pages/Cart/Cart'


const App = () => {
  return (
    <div>
       
        <Menubar/>
        
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/contact' element={<ContactUs/>}/>
          <Route path='/explore' element={<ExploreFood/>}/>
          <Route path='/food/:id' element={<FoodDetails/>}/>
          <Route path='/cart' element={<Cart/>}/>


        </Routes>



  
 
 
     
    </div>
  )
}

export default App
