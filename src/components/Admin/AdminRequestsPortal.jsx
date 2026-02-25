import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import axios from "../../utils/axiosConfig";
import "./AdminRequestsPortal.css";

const AdminRequestsPortal = () => {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  /* ✅ Use activeRole (NOT primaryRole) */
  const empId = user?.empId;
  const roleNo = user?.activeRole?.roleNo;

  const [counts, setCounts] = useState({
    leave: 0,
    ta: 0,
    da: 0,
    ltc: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError("");

        const commonParams = { empId };

        const [leaveRes, taRes, daRes, ltcRes] = await Promise.all([
          axios.get(`/api/leave/approvals/count/pending-for-me`, {
            params: commonParams,
          }),
          axios.get(`/api/ta/approvals/count/pending-for-me`, {
            params: commonParams,
          }),
          axios.get(`/api/da/approvals/count/pending-for-me`, {
            params: commonParams,
          }),
          axios.get(`/api/ltc/approvals/count/pending-for-me`, {
            params: commonParams,
          }),
        ]);

        setCounts({
          leave: leaveRes.data || 0,
          ta: taRes.data || 0,
          da: daRes.data || 0,
          ltc: ltcRes.data || 0,
        });
      } catch (err) {
        console.error("Count fetch error:", err);
        setError(
          err?.response?.data ||
            "Unable to load request counts right now."
        );
      } finally {
        setLoading(false);
      }
    };

    if (empId && roleNo !== undefined) {
      fetchCounts();

      // 🔥 Auto refresh every 20 seconds
      const interval = setInterval(fetchCounts, 20000);

      // 🔥 Instant refresh after approve/reject
      const refreshListener = () => fetchCounts();
      window.addEventListener("countsUpdated", refreshListener);

      return () => {
        clearInterval(interval);
        window.removeEventListener("countsUpdated", refreshListener);
      };
    }
  }, [empId, roleNo]);

  const isChildRoute =
    location.pathname !== "/dashboard/requests";

  return (
    <>
      {isChildRoute ? (
        <Outlet />
      ) : (
        <div className="admin-req">
          <div className="admin-req-header">
            <div>
              <p className="admin-req-badge">Requests</p>
              <h1>Review Requests Pending for You</h1>
              <p className="admin-req-subtitle">
                Requests routed to you based on role.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="admin-req-home-link"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {error && (
            <p className="admin-req-error">
              {typeof error === "string"
                ? error
                : error?.message || JSON.stringify(error)}
            </p>
          )}

          <div className="admin-req-grid">

            {/* LEAVE */}
            <Link
              to="/dashboard/requests/leave"
              className="req-card"
            >
              <div className="req-card-header">
                <span className="req-card-icon req-card-icon-green">
                  📝
                </span>
                <div>
                  <h2>Leave Requests</h2>
                  <p>
                    Pending {loading ? "…" : `(${counts.leave})`}
                  </p>
                </div>
              </div>
              <div className="req-card-footer">
                <span className="req-card-status-dot"></span>
                <span className="req-card-footer-text">
                  Review & Approve / Reject
                </span>
              </div>
            </Link>

            {/* TA */}
            <Link
              to="/dashboard/requests/ta"
              className="req-card"
            >
              <div className="req-card-header">
                <span className="req-card-icon req-card-icon-blue">
                  🚆
                </span>
                <div>
                  <h2>TA Requests</h2>
                  <p>
                    Pending {loading ? "…" : `(${counts.ta})`}
                  </p>
                </div>
              </div>
              <div className="req-card-footer">
                <span className="req-card-status-dot"></span>
                <span className="req-card-footer-text">
                  Verify journeys & amounts
                </span>
              </div>
            </Link>

            {/* DA */}
            <Link
              to="/dashboard/requests/da"
              className="req-card"
            >
              <div className="req-card-header">
                <span className="req-card-icon req-card-icon-amber">
                  🍽️
                </span>
                <div>
                  <h2>DA Requests</h2>
                  <p>
                    Pending {loading ? "…" : `(${counts.da})`}
                  </p>
                </div>
              </div>
              <div className="req-card-footer">
                <span className="req-card-status-dot"></span>
                <span className="req-card-footer-text">
                  Check eligibility & approve
                </span>
              </div>
            </Link>

            {/* LTC */}
            <Link
              to="/dashboard/requests/ltc"
              className="req-card"
            >
              <div className="req-card-header">
                <span className="req-card-icon req-card-icon-purple">
                  📂
                </span>
                <div>
                  <h2>LTC Requests</h2>
                  <p>
                    Pending {loading ? "…" : `(${counts.ltc})`}
                  </p>
                </div>
              </div>
              <div className="req-card-footer">
                <span className="req-card-status-dot"></span>
                <span className="req-card-footer-text">
                  Open LTC dashboard
                </span>
              </div>
            </Link>

          </div>
        </div>
      )}
    </>
  );
};

export default AdminRequestsPortal;