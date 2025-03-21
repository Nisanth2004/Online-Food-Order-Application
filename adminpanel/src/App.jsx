import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import AddFood from './pages/AddFood/AddFood'
import ListFood from './pages/ListFood/ListFood'
import Orders from './pages/Orders/Orders'
import Sidebar from './components/Sidebar/Sidebar'
import Menubar from './components/Menubar/Menubar'

import { ToastContainer } from 'react-toastify';
const App = () => {


  const [sidebarVisible,setSidebarVisisble]=useState(true)

  const toggleSidebar=()=>{
    setSidebarVisisble(!sidebarVisible)
  }
  return (
    <div className="d-flex" id="wrapper">
            {/* Sidebar--> */}
            <Sidebar sidebarVisible={sidebarVisible} />
            
            {/* Page content wrapper--> */}
            <div id="page-content-wrapper">
              <Menubar  toggleSidebar={toggleSidebar}/>
                {/* Top navigation--> */}
                <ToastContainer/>
               
                {/* Page content */}
                <div className="container-fluid">
                    <Routes>

                    <Route path='/' element={<ListFood/>}/>
                      <Route path='/add' element={<AddFood/>}/>

                      <Route path='/list' element={<ListFood/>}/>

                      <Route path='/orders' element={<Orders/>}/>
                    </Routes>
                </div>
            </div>
        </div>
  )
}

export default App
