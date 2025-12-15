import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goHome = () => navigate("/dashboard/admin");
  const logout = () => navigate("/login");

  const isHomeActive = pathname === "/dashboard/admin";
  const isApplyActive = pathname.startsWith("/dashboard/admin/apply");
  const isRequestsActive = pathname.startsWith("/dashboard/admin/requests");

  const { passwordExpiringSoon, daysToPasswordExpiry } = useMemo(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      return {
        passwordExpiringSoon: !!parsed.passwordExpiringSoon,
        daysToPasswordExpiry: parsed.daysToPasswordExpiry,
      };
    } catch {
      return {};
    }
  }, []);

  const settingsTitle = passwordExpiringSoon
    ? `Password expires in ${daysToPasswordExpiry ?? "few"} days`
    : "Settings";

  return (
    <nav className="navbar navbar-admin">
      <div className="navbar-left">
        <div className="navbar-logo" onClick={goHome}>
          <span className="navbar-logo-mark">●</span>
          <span className="navbar-logo-text">Admin Panel</span>
        </div>

        <ul className="navbar-links">
          <li className={`navbar-link ${isHomeActive ? "navbar-link-active" : ""}`} onClick={goHome}>
            Admin Home
          </li>
          <li className={`navbar-link ${isApplyActive ? "navbar-link-active" : ""}`} onClick={() => navigate("/dashboard/admin/apply")}>
            Apply
          </li>
          <li className={`navbar-link ${isRequestsActive ? "navbar-link-active" : ""}`} onClick={() => navigate("/dashboard/admin/requests")}>
            Requests
          </li>
        </ul>
      </div>

      <div className="navbar-center">
        <input className="search-bar" placeholder="Search requests, employees..." />
      </div>

      <div className="navbar-right">
        <ul className="navbar-links navbar-links-right">
          <li
            className={`navbar-link navbar-link-subtle ${passwordExpiringSoon ? "navbar-link-warning" : ""}`}
            title={settingsTitle}
            onClick={() => navigate("/settings")}
          >
            Settings
          </li>
          <li>
            <button className="navbar-btn navbar-btn-outline" onClick={logout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;
