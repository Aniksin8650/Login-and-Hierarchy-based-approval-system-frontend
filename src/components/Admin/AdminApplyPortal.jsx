import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminApplyPortal.css";

const AdminApplyPortal = () => {
  const [empId, setEmpId] = useState("");

  const [pendingLeave, setPendingLeave] = useState(null);
  const [pendingTa, setPendingTa] = useState(null);
  const [pendingDa, setPendingDa] = useState(null);
  const [pendingLtc, setPendingLtc] = useState(null);

  // --- Load admin's empId from localStorage ---
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

  // --- Fetch pending counts (initial + every 30s) ---
  useEffect(() => {
    if (!empId) return;

    const BASE_URL = "http://localhost:8080";

    const fetchCount = async (url, setter) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error("Failed to fetch count:", url, res.status);
          setter(null);
          return;
        }
        const text = await res.text();
        const num = parseInt(text, 10);
        setter(isNaN(num) ? null : num);
      } catch (err) {
        console.error("Error fetching count:", url, err);
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
    const id = setInterval(fetchAll, 30000); // auto-refresh every 30s
    return () => clearInterval(id);
  }, [empId]);

  // --- Lock logic ---
  const leaveLocked = pendingLeave !== null && pendingLeave >= 3;
  const taLocked = pendingTa !== null && pendingTa >= 3;
  const daLocked = pendingDa !== null && pendingDa >= 3;
  const ltcLocked = pendingLtc !== null && pendingLtc >= 3;

  const handleLockedClick = (e) => {
    e.preventDefault();
    window.alert(
      "Application limit reached (3 pending). Please wait for them to be processed."
    );
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
        <Link
          to={leaveLocked ? "#" : "/admin/apply/leave"}
          className={`apply-card ${leaveLocked ? "apply-card-locked" : ""}`}
          onClick={leaveLocked ? handleLockedClick : undefined}
        >
          <div className="apply-card-header">
            <span className="apply-card-icon">📝</span>
            <h2>Leave Application</h2>
          </div>
          <p>
            Apply for casual leave, earned leave, or any official leave
            category with proper dates and reasons.
          </p>
          <p className="apply-card-pending">
            Pending applications: {pendingLeave === null ? "-" : pendingLeave}
          </p>
          <div className="apply-card-footer">
            <span>{leaveLocked ? "Limit reached" : "Start Leave Form"}</span>
          </div>
        </Link>

        {/* TA */}
        <Link
          to={taLocked ? "#" : "/admin/apply/ta"}
          className={`apply-card ${taLocked ? "apply-card-locked" : ""}`}
          onClick={taLocked ? handleLockedClick : undefined}
        >
          <div className="apply-card-header">
            <span className="apply-card-icon">🚆</span>
            <h2>TA Application</h2>
          </div>
          <p>
            Submit travel allowance requests for official journeys, including
            distance, mode, and claim details.
          </p>
          <p className="apply-card-pending">
            Pending applications: {pendingTa === null ? "-" : pendingTa}
          </p>
          <div className="apply-card-footer">
            <span>{taLocked ? "Limit reached" : "Submit TA Claim"}</span>
          </div>
        </Link>

        {/* DA */}
        <Link
          to={daLocked ? "#" : "/admin/apply/da"}
          className={`apply-card ${daLocked ? "apply-card-locked" : ""}`}
          onClick={daLocked ? handleLockedClick : undefined}
        >
          <div className="apply-card-header">
            <span className="apply-card-icon">🍽️</span>
            <h2>DA Application</h2>
          </div>
          <p>
            Request daily allowance for duty tours, meetings, and official work
            outside headquarters.
          </p>
          <p className="apply-card-pending">
            Pending applications: {pendingDa === null ? "-" : pendingDa}
          </p>
          <div className="apply-card-footer">
            <span>{daLocked ? "Limit reached" : "Submit DA Claim"}</span>
          </div>
        </Link>

        {/* LTC */}
        <Link
          to={ltcLocked ? "#" : "/admin/apply/ltc"}
          className={`apply-card ${ltcLocked ? "apply-card-locked" : ""}`}
          onClick={ltcLocked ? handleLockedClick : undefined}
        >
          <div className="apply-card-header">
            <span className="apply-card-icon">✈️</span>
            <h2>LTC Application</h2>
          </div>
          <p>
            Apply for Leave Travel Concession as per rules, including journey
            details and eligible family members.
          </p>
          <p className="apply-card-pending">
            Pending applications: {pendingLtc === null ? "-" : pendingLtc}
          </p>
          <div className="apply-card-footer">
            <span>{ltcLocked ? "Limit reached" : "Apply for LTC"}</span>
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
