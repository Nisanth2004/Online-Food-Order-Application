import React from 'react'
import Menubar from './components/Menubar'
import {  Route, Routes } from 'react-router-dom'
import Home from './Pages/Home/Home'
import ContactUs from './Pages/Contact/Contact'
import ExploreFood from './Pages/ExploreFood/ExploreFood'


const App = () => {
  return (
    <div>
       
        <Menubar/>
        
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/contact' element={<ContactUs/>}/>
          <Route path='/explore' element={<ExploreFood/>}/>



        </Routes>



  
 
 
     
    </div>
  )
}

export default App
