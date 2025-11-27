import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Branding */}
        <div className="footer-logo">
          <span className="footer-logo-mark">●</span>
          <span className="footer-logo-text">LeaveSuite</span>
        </div>

        {/* Middle info */}
        <div className="footer-links">
          <p>© 2025 LeaveSuite. All Rights Reserved.</p>
          <p className="footer-tagline">A unified portal for Leave & TA/DA/LTC workflows.</p>
        </div>

        {/* Right */}
        <div className="footer-social">
          <span className="footer-dot"></span>
          <span className="footer-dot"></span>
          <span className="footer-dot"></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
