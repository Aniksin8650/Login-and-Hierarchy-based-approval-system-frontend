import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goHome = () => {
    navigate("/admin-dashboard");
  };

  const logout = () => {
    navigate("/login");
  };

  const isHomeActive =
    pathname === "/admin-dashboard" || pathname === "/admin";

  const isApplyActive = pathname.startsWith("/admin/apply");
  const isRequestsActive = pathname.startsWith("/admin/requests");

  return (
    <nav className="navbar navbar-admin">
      {/* Left Section */}
      <div className="navbar-left">
        <div className="navbar-logo" onClick={goHome}>
          <span className="navbar-logo-mark">●</span>
          <span className="navbar-logo-text">Admin Panel</span>
        </div>

        <ul className="navbar-links">
          <li
            className={`navbar-link ${
              isHomeActive ? "navbar-link-active" : ""
            }`}
            onClick={goHome}
          >
            Admin Home
          </li>
          <li
            className={`navbar-link ${
              isApplyActive ? "navbar-link-active" : ""
            }`}
            onClick={() => navigate("/admin/apply")}
          >
            Apply
          </li>
          <li
            className={`navbar-link ${
              isRequestsActive ? "navbar-link-active" : ""
            }`}
            onClick={() => navigate("/admin/requests")}
          >
            Requests
          </li>
        </ul>
      </div>

      {/* Center Section */}
      <div className="navbar-center">
        <div className="navbar-search-wrapper">
          <input
            type="text"
            placeholder="Search requests, employees..."
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

export default AdminNavbar;
