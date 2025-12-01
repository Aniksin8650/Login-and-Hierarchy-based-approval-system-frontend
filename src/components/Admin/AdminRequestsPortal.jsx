import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./AdminRequestsPortal.css";

const API_BASE = "http://localhost:8080";

const AdminRequestsPortal = () => {
  const [leaveCounts, setLeaveCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaveCounts = async () => {
      try {
        setLoading(true);
        setError("");

        const statuses = ["PENDING", "APPROVED", "REJECTED"];

        const responses = await Promise.all(
          statuses.map((status) =>
            axios.get(`${API_BASE}/api/leave/status/${status}`)
          )
        );

        const [pendingRes, approvedRes, rejectedRes] = responses;

        setLeaveCounts({
          pending: pendingRes.data?.length ?? 0,
          approved: approvedRes.data?.length ?? 0,
          rejected: rejectedRes.data?.length ?? 0,
        });
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data ||
            "Unable to load leave request counts right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveCounts();
  }, []);

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
        <div className="req-chip">
          Pending {loading ? "…" : `(${leaveCounts.pending})`}
        </div>
        <div className="req-chip req-chip-soft">
          Approved {loading ? "…" : `(${leaveCounts.approved})`}
        </div>
        <div className="req-chip req-chip-soft">
          Rejected {loading ? "…" : `(${leaveCounts.rejected})`}
        </div>
        <span className="req-chip-hint">
          Currently showing counts for <strong>Leave</strong> applications.
          TA / DA / LTC can be wired with similar endpoints.
        </span>
      </div>

      {error && <p className="admin-req-error">{error}</p>}

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

        <Link to="/admin/requests/ltc" className="req-card">
          <div className="req-card-header">
            <span className="req-card-icon req-card-icon-purple">📂</span>
            <div>
              <h2>LTC Requests</h2>
              <p>LTC request types handled by admin.</p>
            </div>
          </div>
          <div className="req-card-footer">
            <span className="req-card-status-dot"></span>
            <span className="req-card-footer-text">
              Open LTC requests dashboard
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminRequestsPortal;
