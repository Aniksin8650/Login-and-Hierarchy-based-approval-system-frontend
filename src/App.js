import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 🔹 Shared Layout
import NavbarSwitcher from "./components/Shared/Navbar/NavbarSwitcher";
import Footer from "./components/Shared/Footer";

// 🌐 Public / Shared Pages
import Home from "./components/Shared/Home";
import Login from "./components/Shared/Login";
import Register from "./components/Shared/Register";
import About from "./components/Shared/About";
import Settings from "./components/Shared/Settings";

// 🧭 Employee Pages
import Dashboard from "./components/Shared/Dashboard"; // Employee dashboard
import LeaveApplication from "./components/Leave/LeaveApplication";
import TAApplication from "./components/TA/TAApplication";
import DAApplication from "./components/DA/DAApplication";
import LTCApplication from "./components/LTC/LTCApplication";
import PrintLeaveApplications from "./components/Leave/PrintLeaveApplications";

// 🔐 Admin Pages (Dash + Requests)
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminLeave from "./components/Admin/AdminLeave";
import AdminTada from "./components/Admin/AdminTada";
import AdminLtc from "./components/Admin/AdminLtc";
import AdminOther from "./components/Admin/AdminOther";

// 🔐 Admin Pages (Apply / Requests Portals)
import AdminApplyPortal from "./components/Admin/AdminApplyPortal";
import AdminRequestsPortal from "./components/Admin/AdminRequestsPortal";

function App() {
  return (
    <Router>
      <div className="App">
        {/* 🔼 Dynamic header (Public / Employee / Admin) */}
        <NavbarSwitcher />

        {/* Main page content (pushed down because navbar is fixed) */}
        <div style={{ minHeight: "80vh", marginTop: "80px" }}>
          <Routes>
            {/* =================== PUBLIC / PRE-LOGIN AREA =================== */}
            {/* Homepage -> has Login button -> /login */}
            <Route path="/" element={<Home />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* =================== EMPLOYEE AREA =================== */}
            {/* Employee Dashboard (already logged-in normal user) */}
            <Route path="/employee-dashboard" element={<Dashboard />} />

            {/* Optional: keep older behaviour if something still links to /dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Employee’s 4 main modules */}
            <Route path="/leave-application" element={<LeaveApplication />} />
            <Route path="/TA-application" element={<TAApplication />} />
            <Route path="/DA-application" element={<DAApplication />} />
            <Route path="/LTC-application" element={<LTCApplication />} />

            {/* Extra employee pages */}
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/print-leaves" element={<PrintLeaveApplications />} />

            {/* =================== ADMIN AREA =================== */}
            {/* After admin login, redirect here */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            {/* ---- Admin dashboard will have two big buttons: APPLY and REQUESTS ----
                 These two routes are the landing pages for those buttons */}

            {/* 1️⃣ Admin APPLY portal (admin applying for own leaves/TA/DA/LTC) */}
            <Route path="/admin/apply" element={<AdminApplyPortal />} />
            {/* Inside Apply portal, show 4 cards that link to below paths: */}
            <Route path="/admin/apply/leave" element={<LeaveApplication />} />
            <Route path="/admin/apply/ta" element={<TAApplication />} />
            <Route path="/admin/apply/da" element={<DAApplication />} />
            <Route path="/admin/apply/ltc" element={<LTCApplication />} />

            {/* 2️⃣ Admin REQUESTS portal (approve / reject employees’ requests) */}
            <Route path="/admin/requests" element={<AdminRequestsPortal />} />
            {/* Inside Requests portal, show 4 cards that link to below paths: */}
            <Route path="/admin/requests/leave" element={<AdminLeave />} />
            <Route path="/admin/requests/ta" element={<AdminTada />} />
            <Route path="/admin/requests/ltc" element={<AdminLtc />} />
            <Route path="/admin/requests/other" element={<AdminOther />} />
          </Routes>
        </div>

        {/* 🔽 Common footer for everyone */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
