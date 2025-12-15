import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const EmployeeNavbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goHome = () => {
    navigate("/dashboard");
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isDashboardActive = pathname === "/dashboard";
  const isApplyActive = pathname.startsWith("/dashboard/apply");
  const isRequestsActive = pathname.startsWith("/dashboard/requests");

  /* ===== ROLE / CAPABILITY CHECK ===== */
  const canApprove = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return false;
      const u = JSON.parse(stored);
      const roleName = u?.activeRole?.roleName?.toUpperCase() || "";
      return ["DIVISION", "DIRECTOR", "ADMIN", "FINANCE"].some((r) =>
        roleName.includes(r)
      );
    } catch {
      return false;
    }
  }, []);

  /* ===== PASSWORD EXPIRY INFO ===== */
  const { passwordExpiringSoon, daysToPasswordExpiry } = useMemo(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (!stored)
        return { passwordExpiringSoon: false, daysToPasswordExpiry: null };
      const parsed = JSON.parse(stored);
      return {
        passwordExpiringSoon: !!parsed.passwordExpiringSoon,
        daysToPasswordExpiry: parsed.daysToPasswordExpiry,
      };
    } catch {
      return { passwordExpiringSoon: false, daysToPasswordExpiry: null };
    }
  }, []);

  const settingsTitle = passwordExpiringSoon
    ? `Password will expire in ${daysToPasswordExpiry ?? "few"} day${
        daysToPasswordExpiry === 1 ? "" : "s"
      }. Please change it.`
    : "Settings";

  return (
    <nav className="navbar navbar-employee">
      {/* Left */}
      <div className="navbar-left">
        <div className="navbar-logo" onClick={goHome}>
          <span className="navbar-logo-mark">●</span>
          <span className="navbar-logo-text">Dashboard</span>
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
              isApplyActive ? "navbar-link-active" : ""
            }`}
            onClick={() => navigate("/dashboard/apply")}
          >
            Apply
          </li>

          {/* ✅ REQUESTS ADDED */}
          {canApprove && (
            <li
              className={`navbar-link ${
                isRequestsActive ? "navbar-link-active" : ""
              }`}
              onClick={() => navigate("/dashboard/requests")}
            >
              Requests
            </li>
          )}
        </ul>
      </div>

      {/* Center */}
      <div className="navbar-center">
        <div className="navbar-search-wrapper">
          <input
            type="text"
            placeholder="Search applications..."
            className="search-bar"
          />
        </div>
      </div>

      {/* Right */}
      <div className="navbar-right">
        <ul className="navbar-links navbar-links-right">
          <li
            className={`navbar-link navbar-link-subtle ${
              passwordExpiringSoon ? "navbar-link-warning" : ""
            }`}
            onClick={() => navigate("/settings")}
            title={settingsTitle}
          >
            Settings
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

export default EmployeeNavbar;
