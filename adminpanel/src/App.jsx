import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import AddFood from './pages/AddFood/AddFood'
import ListFood from './pages/ListFood/ListFood'
import Orders from './pages/Orders/Orders'
import Sidebar from './components/Sidebar/Sidebar'
import Menubar from './components/Menubar/Menubar'
import AdminReview from './components/Reviews/AdminReview';
import { ToastContainer } from 'react-toastify';
import AdminCancelRequests from './components/CancelledOrders/AdminCancelRequests'
import StockManagement from './components/StockManagement'
import EditFood from './components/EditFood'
import StockDashboard from './components/StockDashboard/StockDashboard'
import StockAnalytics from './components/StockAnalytics/StockAnalytics'
import StockLogs from './components/StockLogs/StockLogs'
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
                      <Route path="/stock-management" element={<StockManagement />} />
<Route path="/edit/:id" element={<EditFood />} />

                      <Route path="/reviews" element={<AdminReview />} />
                      <Route path="/analytics" element={<StockAnalytics />} />
                       <Route path="/logs" element={<StockLogs />} />
                      <Route path="/admin/stock-dashboard" element={<StockDashboard />} />

                       <Route path="/admin-cancel-requests" element={<AdminCancelRequests />} /> 
                    </Routes>
                </div>
            </div>
        </div>
  )
}

export default App
