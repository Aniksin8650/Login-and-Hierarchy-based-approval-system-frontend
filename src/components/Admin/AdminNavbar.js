import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css"; // reuse same CSS

const AdminNavbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* Left Section */}
      <div className="navbar-left">
        <div
          className="navbar-logo"
          onClick={() => navigate("/admin-dashboard")}
          style={{ cursor: "pointer" }}
        >
          MySite (Admin)
        </div>
        <ul className="navbar-links">
          <li onClick={() => navigate("/admin-dashboard")}>Home</li>
        </ul>
      </div>

      {/* Center Search */}
      <div className="navbar-center">
        <input type="text" placeholder="Search..." className="search-bar" />
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        <ul className="navbar-links">
          {/* Profile Dropdown */}
          <li
            className="dropdown"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            Profile 👤
            {showProfileMenu && (
              <div className="dropdown-menu profile-menu">
                <img
                  src="logo192.png"
                  alt="Profile"
                  className="profile-pic"
                />
                <p onClick={() => alert("Account Settings coming soon!")}>
                  Account Settings
                </p>
                <p
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/login");
                  }}
                >
                  Logout
                </p>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default AdminNavbar;
