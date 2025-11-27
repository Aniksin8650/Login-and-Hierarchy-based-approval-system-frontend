import React from "react";
import { Link } from "react-router-dom";
import "./AdminRequestsPortal.css";

const AdminRequestsPortal = () => {
  return (
    <div className="admin-req">
      <div className="admin-req-header">
        <div>
          <p className="admin-req-badge">Admin • Requests</p>
          <h1>Review Employee Requests</h1>
          <p className="admin-req-subtitle">
            View, filter, and take action on employee Leave, TA, DA and LTC
            requests from a single place.
          </p>
        </div>

        <Link to="/admin-dashboard" className="admin-req-home-link">
          ← Back to Admin Dashboard
        </Link>
      </div>

      <div className="admin-req-summary">
        <div className="req-chip">Pending</div>
        <div className="req-chip req-chip-soft">Approved</div>
        <div className="req-chip req-chip-soft">Rejected</div>
        <span className="req-chip-hint">
          (Counts and filters can be wired when backend is ready)
        </span>
      </div>

      <div className="admin-req-grid">
        <Link to="/admin/requests/leave" className="req-card">
          <div className="req-card-header">
            <span className="req-card-icon req-card-icon-green">📝</span>
            <div>
              <h2>Leave Requests</h2>
              <p>All pending and processed leave applications.</p>
            </div>
          </div>
          <div className="req-card-footer">
            <span className="req-card-status-dot"></span>
            <span className="req-card-footer-text">
              Review & Approve / Reject
            </span>
          </div>
        </Link>

        <Link to="/admin/requests/ta" className="req-card">
          <div className="req-card-header">
            <span className="req-card-icon req-card-icon-blue">🚆</span>
            <div>
              <h2>TA Requests</h2>
              <p>Travel allowance claims from employees.</p>
            </div>
          </div>
          <div className="req-card-footer">
            <span className="req-card-status-dot"></span>
            <span className="req-card-footer-text">
              Check journey details & amount
            </span>
          </div>
        </Link>

        <Link to="/admin/requests/da" className="req-card">
          <div className="req-card-header">
            <span className="req-card-icon req-card-icon-amber">🍽️</span>
            <div>
              <h2>DA Requests</h2>
              <p>Daily allowance requests for official tours.</p>
            </div>
          </div>
          <div className="req-card-footer">
            <span className="req-card-status-dot"></span>
            <span className="req-card-footer-text">
              Verify eligibility and approve
            </span>
          </div>
        </Link>

        <Link to="/admin/requests/other" className="req-card">
          <div className="req-card-header">
            <span className="req-card-icon req-card-icon-purple">📂</span>
            <div>
              <h2>Other Requests</h2>
              <p>Any additional request types handled by admin.</p>
            </div>
          </div>
          <div className="req-card-footer">
            <span className="req-card-status-dot"></span>
            <span className="req-card-footer-text">
              Open the requests dashboard
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminRequestsPortal;
