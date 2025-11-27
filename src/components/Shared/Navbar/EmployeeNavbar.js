import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const EmployeeNavbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goHome = () => {
    navigate("/employee-dashboard");
  };

  const logout = () => {
    navigate("/login");
  };

  const isDashboardActive =
    pathname === "/employee-dashboard" || pathname === "/dashboard";

  const isLeaveActive = pathname.startsWith("/leave-application");
  const isTaActive = pathname.startsWith("/TA-application");
  const isDaActive = pathname.startsWith("/DA-application");
  const isLtcActive = pathname.startsWith("/LTC-application");

  return (
    <nav className="navbar navbar-employee">
      {/* Left Section */}
      <div className="navbar-left">
        <div className="navbar-logo" onClick={goHome}>
          <span className="navbar-logo-mark">●</span>
          <span className="navbar-logo-text">Employee</span>
        </div>

        <ul className="navbar-links">
          <li
            className={`navbar-link ${
              isDashboardActive ? "navbar-link-active" : ""
            }`}
            onClick={goHome}
          >
            Dashboard
          </li>
          <li
            className={`navbar-link ${
              isLeaveActive ? "navbar-link-active" : ""
            }`}
            onClick={() => navigate("/leave-application")}
          >
            Leave
          </li>
          <li
            className={`navbar-link ${
              isTaActive ? "navbar-link-active" : ""
            }`}
            onClick={() => navigate("/TA-application")}
          >
            TA
          </li>
          <li
            className={`navbar-link ${
              isDaActive ? "navbar-link-active" : ""
            }`}
            onClick={() => navigate("/DA-application")}
          >
            DA
          </li>
          <li
            className={`navbar-link ${
              isLtcActive ? "navbar-link-active" : ""
            }`}
            onClick={() => navigate("/LTC-application")}
          >
            LTC
          </li>
        </ul>
      </div>

      {/* Center Section */}
      <div className="navbar-center">
        <div className="navbar-search-wrapper">
          <input
            type="text"
            placeholder="Search your applications..."
            className="search-bar"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        <ul className="navbar-links navbar-links-right">
          <li
            className="navbar-link navbar-link-subtle"
            onClick={() => navigate("/settings")}
          >
            Settings
          </li>
          <li>
            <button
              className="navbar-btn navbar-btn-outline"
              onClick={logout}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default EmployeeNavbar;
