import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DashboardLayout.css";

const formatRoleName = (role = "") =>
  role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const DashboardSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const role = user?.activeRole || {};
  const empId = userInfo?.empId;

  const roleName = role?.roleName || "EMPLOYEE";
  const roleKey = roleName.toUpperCase();
  const roleDisplay = formatRoleName(roleName);

  const roleNo = role?.roleNo;
  const division = role?.division;
  const directorate = role?.directorate;
  const program = userInfo?.program;

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  /* ================= CAPABILITIES ================= */

  const canApprove = roleNo && roleNo < 100;

  /* ================= ROUTE STATE ================= */

  const isDashboard = pathname === "/dashboard";
  const isApply = pathname.startsWith("/dashboard/apply");
  const isRequests = pathname.startsWith("/dashboard/requests");

  /* ================= APPLY COUNTS (FROM BACKEND) ================= */

  const [applyCounts, setApplyCounts] = useState({
    leave: null,
    ta: null,
    da: null,
    ltc: null,
  });

  useEffect(() => {
    if (!empId) return;

    const BASE_URL = "http://localhost:8080";

    const fetchCount = async (url, key) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          setApplyCounts((p) => ({ ...p, [key]: null }));
          return;
        }
        const text = await res.text();
        const num = parseInt(text, 10);
        setApplyCounts((p) => ({ ...p, [key]: isNaN(num) ? null : num }));
      } catch {
        setApplyCounts((p) => ({ ...p, [key]: null }));
      }
    };

    fetchCount(`${BASE_URL}/api/leave/count/pending/${empId}`, "leave");
    fetchCount(`${BASE_URL}/api/ta/count/pending/${empId}`, "ta");
    fetchCount(`${BASE_URL}/api/da/count/pending/${empId}`, "da");
    fetchCount(`${BASE_URL}/api/ltc/count/pending/${empId}`, "ltc");
  }, [empId, open]);

  const totalApplyPending = Object.values(applyCounts).reduce(
    (sum, v) => sum + (typeof v === "number" ? v : 0),
    0
  );

  /* ================= REQUEST COUNTS (UNCHANGED – DUMMY) ================= */

  const [requestCounts, setRequestCounts] = useState({
    leave: null,
    ta: null,
    da: null,
    ltc: null,
  });

  useEffect(() => {
    if (!empId || !canApprove) return;

    const BASE_URL = "http://localhost:8080";

    const fetchRequestCount = async (url, key) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          setRequestCounts((p) => ({ ...p, [key]: null }));
          return;
        }
        const text = await res.text();
        const num = parseInt(text, 10);
        setRequestCounts((p) => ({ ...p, [key]: isNaN(num) ? null : num }));
      } catch {
        setRequestCounts((p) => ({ ...p, [key]: null }));
      }
    };

    fetchRequestCount(
      `${BASE_URL}/api/leave/approvals/count/pending-for-me?empId=${empId}`,
      "leave"
    );
    fetchRequestCount(
      `${BASE_URL}/api/ta/approvals/count/pending-for-me?empId=${empId}`,
      "ta"
    );
    fetchRequestCount(
      `${BASE_URL}/api/da/approvals/count/pending-for-me?empId=${empId}`,
      "da"
    );
    fetchRequestCount(
      `${BASE_URL}/api/ltc/approvals/count/pending-for-me?empId=${empId}`,
      "ltc"
    );
  }, [empId, canApprove, open]);


  const totalRequestPending = Object.values(requestCounts).reduce(
    (sum, v) => sum + (typeof v === "number" ? v : 0),
    0
  );


  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`dashboard-sidebar ${open ? "open" : ""}`}>
        {/* ===== HEADER ===== */}
        <div className="sidebar-header">
          <div className="sidebar-profile">
            <div className="avatar">
              {initials}
              <span className="status-dot" />
            </div>

            <div className="role-info">
              <h2>{roleDisplay}</h2>
              <span className="role-badge">{roleName}</span>
              <p>
                {roleNo && <span>{roleNo}</span>}
                {division && <span> • {division}</span>}
                {directorate && <span> • {directorate}</span>}
                {program && <span> • {program}</span>}
              </p>
            </div>
          </div>

          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>

        {/* ===== NAV ===== */}
        <nav className="sidebar-nav">
          {/* DASHBOARD */}
          <div
            className={`sidebar-item ${isDashboard ? "active" : ""}`}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </div>

          {/* APPLY */}
          <div className={`sidebar-group ${isApply ? "open active" : ""}`}>
            <div
              className="sidebar-item"
              onClick={() => navigate("/dashboard/apply")}
            >
              Apply
              {totalApplyPending > 0 && (
                <span className="count-badge">{totalApplyPending}</span>
              )}
            </div>

            {isApply && (
              <div className="sidebar-sub">
                {Object.entries(applyCounts).map(([key, count]) => (
                  <div
                    key={key}
                    className={`sidebar-sub-item ${
                      pathname === `/dashboard/apply/${key}` ? "active" : ""
                    }`}
                    onClick={() => navigate(`/dashboard/apply/${key}`)}
                  >
                    {key.toUpperCase()}
                    {typeof count === "number" && count > 0 && (
                      <span className="count-badge small">{count}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* REQUESTS (UNCHANGED) */}
          {canApprove && (
            <div className={`sidebar-group ${isRequests ? "open active" : ""}`}>
              <div
                className="sidebar-item"
                onClick={() => navigate("/dashboard/requests")}
              >
                Requests
                {totalRequestPending > 0 && (
                  <span className="count-badge">{totalRequestPending}</span>
                )}
              </div>

              {isRequests && (
                <div className="sidebar-sub">
                  {Object.entries(requestCounts).map(([key, count]) => (
                    <div
                      key={key}
                      className={`sidebar-sub-item ${
                        pathname === `/dashboard/requests/${key}` ? "active" : ""
                      }`}
                      onClick={() =>
                        navigate(`/dashboard/requests/${key}`)
                      }
                    >
                      {key.toUpperCase()} Requests
                      {count > 0 && (
                        <span className="count-badge small">{count}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default DashboardSidebar;
