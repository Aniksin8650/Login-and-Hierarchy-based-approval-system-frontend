import React from "react";
import { Link } from "react-router-dom";
import "./AdminApplyPortal.css";

const AdminApplyPortal = () => {
  return (
    <div className="admin-apply">
      <div className="admin-apply-header">
        <div>
          <p className="admin-apply-badge">Admin • Apply</p>
          <h1>Apply for Leave & Travel</h1>
          <p className="admin-apply-subtitle">
            As an administrator, you can submit your own Leave, TA, DA and LTC
            requests directly from this portal.
          </p>
        </div>

        <Link to="/admin-dashboard" className="admin-apply-home-link">
          ← Back to Admin Dashboard
        </Link>
      </div>

      <div className="admin-apply-grid">
        <Link to="/admin/apply/leave" className="apply-card">
          <div className="apply-card-header">
            <span className="apply-card-icon">📝</span>
            <h2>Leave Application</h2>
          </div>
          <p>
            Apply for casual leave, earned leave, or any official leave
            category with proper dates and reasons.
          </p>
          <div className="apply-card-footer">
            <span>Start Leave Form</span>
          </div>
        </Link>

        <Link to="/admin/apply/ta" className="apply-card">
          <div className="apply-card-header">
            <span className="apply-card-icon">🚆</span>
            <h2>TA Application</h2>
          </div>
          <p>
            Submit travel allowance requests for official journeys, including
            distance, mode, and claim details.
          </p>
          <div className="apply-card-footer">
            <span>Submit TA Claim</span>
          </div>
        </Link>

        <Link to="/admin/apply/da" className="apply-card">
          <div className="apply-card-header">
            <span className="apply-card-icon">🍽️</span>
            <h2>DA Application</h2>
          </div>
          <p>
            Request daily allowance for duty tours, meetings, and official work
            outside headquarters.
          </p>
          <div className="apply-card-footer">
            <span>Submit DA Claim</span>
          </div>
        </Link>

        <Link to="/admin/apply/ltc" className="apply-card">
          <div className="apply-card-header">
            <span className="apply-card-icon">✈️</span>
            <h2>LTC Application</h2>
          </div>
          <p>
            Apply for Leave Travel Concession as per rules, including journey
            details and eligible family members.
          </p>
          <div className="apply-card-footer">
            <span>Apply for LTC</span>
          </div>
        </Link>
      </div>

      <div className="admin-apply-note">
        <p>
          <strong>Note:</strong> This section is meant for admin&apos;s own
          applications. To review employee requests, use the{" "}
          <Link to="/admin/requests">Requests Portal</Link>.
        </p>
      </div>
    </div>
  );
};

export default AdminApplyPortal;
