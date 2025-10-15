// import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  // const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* Left Section */}
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          MySite
        </div>
        <ul className="navbar-links">
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/about")}>About</li>
        </ul>
      </div>

      {/* Center Section */}
      <div className="navbar-center">
        <input type="text" placeholder="Search..." className="search-bar" />
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        <ul className="navbar-links">
          <li onClick={() => navigate("/settings")}>Settings</li>
          {/* Profile Dropdown */}
          <li onClick={() => navigate("/login")}>Login 🔐</li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

