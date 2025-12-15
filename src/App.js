import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* 🔹 Shared Layout */
import NavbarSwitcher from "./components/Shared/Navbar/NavbarSwitcher";
import Footer from "./components/Shared/Footer";

/* 🌐 Public Pages */
import Home from "./components/Shared/Home";
import Login from "./components/Shared/Login";
import ChangePassword from "./components/Shared/ChangePassword";
import Register from "./components/Shared/Register";
import About from "./components/Shared/About";
import Settings from "./components/Shared/Settings";

/* 🧭 Core Pages */
import Dashboard from "./components/Shared/Dashboard";
import LeaveApplication from "./components/Leave/LeaveApplication";
import TAApplication from "./components/TA/TAApplication";
import DAApplication from "./components/DA/DAApplication";
import LTCApplication from "./components/LTC/LTCApplication";
import PrintLeaveApplications from "./components/Leave/PrintLeaveApplications";

/* 🔐 Legacy Admin (KEEP – backward compatibility) */
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminApplyPortal from "./components/Admin/AdminApplyPortal";
import AdminRequestsPortal from "./components/Admin/AdminRequestsPortal";
import RequireRole from "./components/Shared/RequireRole";

import AdminLeaveRequests from "./components/Admin/Requests/AdminLeaveRequests";
import AdminTARequests from "./components/Admin/Requests/AdminTARequests";
import AdminDARequests from "./components/Admin/Requests/AdminDARequests";
import AdminLTCRequests from "./components/Admin/Requests/AdminLTCRequests";

/* 🧱 Unified Dashboard Layout */
import DashboardLayout from "./components/Dashboard/DashboardLayout";

function App() {
  return (
    <Router>
      <div className="App">
        {/* 🔼 Navbar */}
        <NavbarSwitcher />

        {/* Main Content */}
        <div style={{ minHeight: "80vh", marginTop: "50px" }}>
          <Routes>

            {/* ================= PUBLIC ================= */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />

            {/* ================= LEGACY ROUTES (DO NOT TOUCH) ================= */}
            <Route path="/employee-dashboard" element={<Dashboard />} />
            <Route path="/leave-application" element={<LeaveApplication />} />
            <Route path="/TA-application" element={<TAApplication />} />
            <Route path="/DA-application" element={<DAApplication />} />
            <Route path="/LTC-application" element={<LTCApplication />} />
            <Route path="/print-leaves" element={<PrintLeaveApplications />} />

            {/* Legacy admin */}
            <Route
              path="/admin"
              element={
                <RequireRole allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </RequireRole>
              }
            />

            {/* ================= NEW UNIFIED DASHBOARD ================= */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Landing */}
              <Route index element={<Dashboard />} />

              {/* APPLY */}
              <Route path="apply">
                {/* default apply page */}
                <Route index element={<LeaveApplication />} />

                <Route path="leave" element={<LeaveApplication />} />
                <Route path="ta" element={<TAApplication />} />
                <Route path="da" element={<DAApplication />} />
                <Route path="ltc" element={<LTCApplication />} />
              </Route>

              {/* REQUESTS */}
              <Route path="requests">
                <Route index element={<AdminRequestsPortal />} />

                <Route path="leave" element={<AdminLeaveRequests />} />
                <Route path="ta" element={<AdminTARequests />} />
                <Route path="da" element={<AdminDARequests />} />
                <Route path="ltc" element={<AdminLTCRequests />} />
              </Route>
            </Route>
          </Routes>
        </div>

        {/* 🔽 Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
