import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminApplyPortal.css";

const AdminApplyPortal = () => {
  const navigate = useNavigate();
  const [empId, setEmpId] = useState("");

  const [pendingLeave, setPendingLeave] = useState(null);
  const [pendingTa, setPendingTa] = useState(null);
  const [pendingDa, setPendingDa] = useState(null);
  const [pendingLtc, setPendingLtc] = useState(null);

  // Load admin empId
  useEffect(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (stored) {
        const u = JSON.parse(stored);
        setEmpId(u.empId || "");
      }
    } catch (err) {
      console.error("Failed to read userInfo for admin apply", err);
    }
  }, []);

  // Fetch pending counts
  useEffect(() => {
    if (!empId) return;

    const BASE_URL = "http://localhost:8080";

    const fetchCount = async (url, setter) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          setter(null);
          return;
        }
        const text = await res.text();
        const num = parseInt(text, 10);
        setter(isNaN(num) ? null : num);
      } catch {
        setter(null);
      }
    };

    const fetchAll = () => {
      fetchCount(`${BASE_URL}/api/leave/count/pending/${empId}`, setPendingLeave);
      fetchCount(`${BASE_URL}/api/ta/count/pending/${empId}`, setPendingTa);
      fetchCount(`${BASE_URL}/api/da/count/pending/${empId}`, setPendingDa);
      fetchCount(`${BASE_URL}/api/ltc/count/pending/${empId}`, setPendingLtc);
    };

    fetchAll();
    const id = setInterval(fetchAll, 30000);
    return () => clearInterval(id);
  }, [empId]);

  // Lock logic
  const leaveLocked = pendingLeave >= 3;
  const taLocked = pendingTa >= 3;
  const daLocked = pendingDa >= 3;
  const ltcLocked = pendingLtc >= 3;

  const go = (path, locked, count) => {
    navigate(path, {
      state: { locked, pendingCount: count }
    });
  };

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

        {/* LEAVE */}
        <div
          className={`apply-card ${leaveLocked ? "apply-card-locked" : ""}`}
          onClick={() =>
            go("/admin/apply/leave", leaveLocked, pendingLeave)
          }
        >
          <div className="apply-card-header">
            <span className="apply-card-icon">📝</span>
            <h2>Leave Application</h2>
          </div>
          <p>
            Apply for casual leave, earned leave, or any official leave category.
          </p>
          <p className={`apply-card-pending ${leaveLocked ? "pending-max" : ""}`}>
            Pending applications: {pendingLeave ?? "-"}
          </p>
          <div className="apply-card-footer">
            <span>
              {leaveLocked
                ? "New submissions disabled"
                : "Start Leave Form"}
            </span>
          </div>
        </div>

        {/* TA */}
        <div
          className={`apply-card ${taLocked ? "apply-card-locked" : ""}`}
          onClick={() =>
            go("/admin/apply/ta", taLocked, pendingTa)
          }
        >
          <div className="apply-card-header">
            <span className="apply-card-icon">🚆</span>
            <h2>TA Application</h2>
          </div>
          <p>
            Submit travel allowance requests for official journeys.
          </p>
          <p className={`apply-card-pending ${taLocked ? "pending-max" : ""}`}>
            Pending applications: {pendingTa ?? "-"}
          </p>
          <div className="apply-card-footer">
            <span>
              {taLocked
                ? "New submissions disabled"
                : "Submit TA Claim"}
            </span>
          </div>
        </div>

        {/* DA */}
        <div
          className={`apply-card ${daLocked ? "apply-card-locked" : ""}`}
          onClick={() =>
            go("/admin/apply/da", daLocked, pendingDa)
          }
        >
          <div className="apply-card-header">
            <span className="apply-card-icon">🍽️</span>
            <h2>DA Application</h2>
          </div>
          <p>
            Request daily allowance for duty tours and official work.
          </p>
          <p className={`apply-card-pending ${daLocked ? "pending-max" : ""}`}>
            Pending applications: {pendingDa ?? "-"}
          </p>
          <div className="apply-card-footer">
            <span>
              {daLocked
                ? "New submissions disabled"
                : "Submit DA Claim"}
            </span>
          </div>
        </div>

        {/* LTC */}
        <div
          className={`apply-card ${ltcLocked ? "apply-card-locked" : ""}`}
          onClick={() =>
            go("/admin/apply/ltc", ltcLocked, pendingLtc)
          }
        >
          <div className="apply-card-header">
            <span className="apply-card-icon">✈️</span>
            <h2>LTC Application</h2>
          </div>
          <p>
            Apply for Leave Travel Concession as per rules.
          </p>
          <p className={`apply-card-pending ${ltcLocked ? "pending-max" : ""}`}>
            Pending applications: {pendingLtc ?? "-"}
          </p>
          <div className="apply-card-footer">
            <span>
              {ltcLocked
                ? "New submissions disabled"
                : "Apply for LTC"}
            </span>
          </div>
        </div>
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
