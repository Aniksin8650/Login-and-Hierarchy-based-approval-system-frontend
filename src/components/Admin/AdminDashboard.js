import React from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";
import PasswordExpiryBanner from "../Shared/PasswordExpiryBanner";

const AdminDashboard = () => {
  return (
    <div className="admin-dash">
      {/* New: password expiry banner */}
      <PasswordExpiryBanner />
      <div className="admin-dash-header">
        <div>
          <p className="admin-dash-badge">Admin • Dashboard</p>
          <h1>Welcome to the Admin Control Panel</h1>
          <p className="admin-dash-subtitle">
            Manage your own applications or review employee requests. Choose a
            portal to continue.
          </p>
        </div>
      </div>

      <div className="admin-dash-main">
        {/* Two main big cards: Apply & Requests */}
        <div className="admin-dash-grid">
          <Link to="/admin/apply" className="admin-dash-card admin-dash-card-apply">
            <div className="admin-dash-card-header">
              <span className="admin-dash-card-icon">✍️</span>
              <div>
                <h2>Leave & Travel Apply</h2>
                <p>
                  Submit new Leave, TA, DA and LTC applications as an admin.
                </p>
              </div>
            </div>
            <div className="admin-dash-card-body">
              <ul>
                <li>Apply for Leave</li>
                <li>Submit TA/DA claims</li>
                <li>Apply for LTC</li>
              </ul>
            </div>
            <div className="admin-dash-card-footer">
              <span>Go to Apply Portal</span>
              <span className="admin-dash-chevron">➜</span>
            </div>
          </Link>

          <Link
            to="/admin/requests"
            className="admin-dash-card admin-dash-card-req"
          >
            <div className="admin-dash-card-header">
              <span className="admin-dash-card-icon">📥</span>
              <div>
                <h2>Employee Requests</h2>
                <p>
                  Review, approve or reject employee Leave, TA, DA and LTC
                  requests.
                </p>
              </div>
            </div>
            <div className="admin-dash-card-body">
              <ul>
                <li>View pending applications</li>
                <li>Approve / Reject requests</li>
                <li>Track processed records</li>
              </ul>
            </div>
            <div className="admin-dash-card-footer">
              <span>Open Requests Portal</span>
              <span className="admin-dash-chevron">➜</span>
            </div>
          </Link>
        </div>

        {/* Optional info strip below cards */}
        <div className="admin-dash-info">
          <div className="admin-dash-info-item">
            <span className="admin-dash-info-label">Role</span>
            <span className="admin-dash-info-value">Administrator</span>
          </div>
          <div className="admin-dash-info-item">
            <span className="admin-dash-info-label">Portals</span>
            <span className="admin-dash-info-value">Apply & Requests</span>
          </div>
          <div className="admin-dash-info-item">
            <span className="admin-dash-info-label">Modules</span>
            <span className="admin-dash-info-value">Leave, TA, DA, LTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
