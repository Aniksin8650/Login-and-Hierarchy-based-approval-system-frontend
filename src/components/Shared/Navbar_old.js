import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname || "/";

  // 🔹 Detect which "mode" we're in based on route
  const isAdminMode = path.startsWith("/admin");
  const isEmployeeMode =
    !isAdminMode &&
    (path.startsWith("/employee") ||
      path.startsWith("/dashboard") ||
      path.startsWith("/leave-application") ||
      path.startsWith("/TA-application") ||
      path.startsWith("/DA-application") ||
      path.startsWith("/LTC-application") ||
      path.startsWith("/print-leaves") ||
      path.startsWith("/settings"));

  const isPublicMode = !isAdminMode && !isEmployeeMode;

  // 🔹 Where should logo / "Home" go?
  const handleLogoClick = () => {
    if (isAdminMode) {
      navigate("/admin-dashboard");
    } else if (isEmployeeMode) {
      navigate("/employee-dashboard");
    } else {
      navigate("/");
    }
  };

  const handleHomeClick = () => {
    handleLogoClick();
  };

  // 🔹 Right-side primary action (Login or Logout – dummy navigation)
  const handlePrimaryAction = () => {
    if (isPublicMode) {
      navigate("/login");
    } else {
      // For now, just navigate back to login as "Logout"
      navigate("/login");
    }
  };

  const primaryActionLabel = isPublicMode ? "Login" : "Logout";

  return (
    <nav className="navbar">
      {/* Left Section */}
      <div className="navbar-left">
        <div className="navbar-logo" onClick={handleLogoClick}>
          {/* You can swap text/logo as needed */}
          <span className="navbar-logo-mark">●</span>
          <span className="navbar-logo-text">LeaveSuite</span>
        </div>

        {/* Links change depending on mode */}
        <ul className="navbar-links">
          {/* Home / Dashboard */}
          <li onClick={handleHomeClick} className="navbar-link">
            {isAdminMode ? "Admin Home" : isEmployeeMode ? "Dashboard" : "Home"}
          </li>

          {isPublicMode && (
            <>
              <li
                onClick={() => navigate("/about")}
                className="navbar-link"
              >
                About
              </li>
            </>
          )}

          {isEmployeeMode && (
            <>
              <li
                className="navbar-link"
                onClick={() => navigate("/leave-application")}
              >
                Leave
              </li>
              <li
                className="navbar-link"
                onClick={() => navigate("/TA-application")}
              >
                TA
              </li>
              <li
                className="navbar-link"
                onClick={() => navigate("/DA-application")}
              >
                DA
              </li>
              <li
                className="navbar-link"
                onClick={() => navigate("/LTC-application")}
              >
                LTC
              </li>
            </>
          )}

          {isAdminMode && (
            <>
              <li
                className="navbar-link"
                onClick={() => navigate("/admin/apply")}
              >
                Apply
              </li>
              <li
                className="navbar-link"
                onClick={() => navigate("/admin/requests")}
              >
                Requests
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Center Section */}
      <div className="navbar-center">
        <div className="navbar-search-wrapper">
          <input
            type="text"
            placeholder={
              isAdminMode
                ? "Search requests, employees..."
                : isEmployeeMode
                ? "Search your applications..."
                : "Search..."
            }
            className="search-bar"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        <ul className="navbar-links navbar-links-right">
          {!isPublicMode && (
            <li
              className="navbar-link navbar-link-subtle"
              onClick={() => navigate("/settings")}
            >
              Settings
            </li>
          )}

          {/* Login / Logout Button */}
          <li>
            <button
              className={
                isPublicMode
                  ? "navbar-btn navbar-btn-primary"
                  : "navbar-btn navbar-btn-outline"
              }
              onClick={handlePrimaryAction}
            >
              {primaryActionLabel}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
