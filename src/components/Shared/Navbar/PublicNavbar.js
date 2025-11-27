import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const PublicNavbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogoClick = () => {
    navigate("/");
  };

  const isActive = (path) => pathname === path;

  return (
    <nav className="navbar navbar-public">
      {/* Left Section */}
      <div className="navbar-left">
        <div className="navbar-logo" onClick={handleLogoClick}>
          <span className="navbar-logo-mark">●</span>
          <span className="navbar-logo-text">LeaveSuite</span>
        </div>

        <ul className="navbar-links">
          <li
            className={`navbar-link ${
              isActive("/") ? "navbar-link-active" : ""
            }`}
            onClick={() => navigate("/")}
          >
            Home
          </li>
          <li
            className={`navbar-link ${
              isActive("/about") ? "navbar-link-active" : ""
            }`}
            onClick={() => navigate("/about")}
          >
            About
          </li>
        </ul>
      </div>

      {/* Center Section */}
      <div className="navbar-center">
        <div className="navbar-search-wrapper">
          <input
            type="text"
            placeholder="Search..."
            className="search-bar"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        <ul className="navbar-links navbar-links-right">
          <li>
            <button
              className="navbar-btn navbar-btn-primary"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default PublicNavbar;
