import React, { useMemo } from "react";
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

  // Read password expiry info from localStorage
  const { passwordExpiringSoon, daysToPasswordExpiry } = useMemo(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (!stored) return { passwordExpiringSoon: false, daysToPasswordExpiry: null };
      const parsed = JSON.parse(stored);
      return {
        passwordExpiringSoon: !!parsed.passwordExpiringSoon,
        daysToPasswordExpiry: parsed.daysToPasswordExpiry,
      };
    } catch (e) {
      console.error("Error reading userInfo from localStorage", e);
      return { passwordExpiringSoon: false, daysToPasswordExpiry: null };
    }
  }, []);

  const settingsTitle = passwordExpiringSoon
    ? `Password will expire in ${daysToPasswordExpiry ?? "few"} day${
        daysToPasswordExpiry === 1 ? "" : "s"
      }. Please change it.`
    : "Settings";

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
            className={`navbar-link navbar-link-subtle ${
              passwordExpiringSoon ? "navbar-link-warning" : ""
            }`}
            onClick={() => navigate("/settings")}
            title={settingsTitle}
          >
            <span>Settings</span>
            {passwordExpiringSoon && (
              <span className="navbar-badge navbar-badge-danger" />
            )}
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
