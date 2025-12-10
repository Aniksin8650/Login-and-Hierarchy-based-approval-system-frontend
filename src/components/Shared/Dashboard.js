import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import PasswordExpiryBanner from "./PasswordExpiryBanner";

const Dashboard = () => {
  const navigate = useNavigate();

  const [empId, setEmpId] = useState("");
  const [name, setName] = useState("User");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");

  // password info
  const [lastPasswordChange, setLastPasswordChange] = useState("");
  const [daysRemaining, setDaysRemaining] = useState(null);

  // pending counts
  const [pendingLeave, setPendingLeave] = useState(null);
  const [pendingTa, setPendingTa] = useState(null);
  const [pendingDa, setPendingDa] = useState(null);
  const [pendingLtc, setPendingLtc] = useState(null);

  const [loadingUser, setLoadingUser] = useState(true);

  // Load user info from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (stored) {
        const u = JSON.parse(stored);

        setEmpId(u.empId || "");
        setName(u.name || "User");
        setDepartment(u.department || "");
        setDesignation(u.designation || "");
        setRole(u.role || "");
        setEmail(u.email || "");

        setLastPasswordChange(u.lastPasswordChangeDate || "");
        setDaysRemaining(
          u.daysToPasswordExpiry !== undefined ? u.daysToPasswordExpiry : null
        );
      }
    } catch (err) {
      console.error("Failed to read user info", err);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // Load pending counts once we know empId
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

    fetchCount(`${BASE_URL}/api/leave/count/pending/${empId}`, setPendingLeave);
    fetchCount(`${BASE_URL}/api/ta/count/pending/${empId}`, setPendingTa);
    fetchCount(`${BASE_URL}/api/da/count/pending/${empId}`, setPendingDa);
    fetchCount(`${BASE_URL}/api/ltc/count/pending/${empId}`, setPendingLtc);
  }, [empId]);

  // Helpers: lock logic & click handling
  const leaveLocked = pendingLeave !== null && pendingLeave >= 3;
  const taLocked = pendingTa !== null && pendingTa >= 3;
  const daLocked = pendingDa !== null && pendingDa >= 3;
  const ltcLocked = pendingLtc !== null && pendingLtc >= 3;

  const handleModuleClick = (type) => {
    const limitMsg =
      "Application limit reached (3 pending). Please wait for them to be processed.";

    switch (type) {
      case "leave":
        if (leaveLocked) {
          window.alert(limitMsg);
          return;
        }
        navigate("/leave-application");
        break;
      case "ta":
        if (taLocked) {
          window.alert(limitMsg);
          return;
        }
        navigate("/TA-application");
        break;
      case "da":
        if (daLocked) {
          window.alert(limitMsg);
          return;
        }
        navigate("/DA-application");
        break;
      case "ltc":
        if (ltcLocked) {
          window.alert(limitMsg);
          return;
        }
        navigate("/LTC-application");
        break;
      default:
        break;
    }
  };

  return (
    <div className="empdash">
      {/* Password expiry banner at top */}
      <PasswordExpiryBanner />

      <div className="empdash-bg-circle empdash-bg-1" />
      <div className="empdash-bg-circle empdash-bg-2" />

      <div className="empdash-container">
        {/* Header */}
        <header className="empdash-header">
          <div>
            <p className="empdash-badge">Employee Portal</p>
            <h1>Welcome{loadingUser ? "" : `, ${name}`}</h1>
            <p className="empdash-subtitle">
              {loadingUser
                ? "Loading your details..."
                : department || designation
                ? `Department: ${department || "N/A"} • Designation: ${
                    designation || "N/A"
                  }`
                : "Access your leave and travel modules from a single place."}
            </p>
          </div>

          {/* Profile card on the right */}
          <div className="empdash-profile-card">
            <div className="empdash-avatar">
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="empdash-profile-info">
              <p className="empdash-profile-name">{name}</p>
              <p className="empdash-profile-meta">
                {role || "Employee"} {empId ? `• ID: ${empId}` : ""}
              </p>
              {email && <p className="empdash-profile-email">{email}</p>}

              {/* Password info block */}
              {lastPasswordChange && (
                <div className="empdash-passinfo">
                  <p>
                    <strong>Last Password Change:</strong>{" "}
                    {lastPasswordChange}
                  </p>
                  {daysRemaining !== null && (
                    <p>
                      <strong>Days Remaining:</strong> {daysRemaining} day
                      {daysRemaining === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Quick actions - 4 main modules */}
        <section className="empdash-section">
          <h2>Your Applications</h2>
          <p className="empdash-section-subtitle">
            Start a new application or continue using one of the core employee
            modules.
          </p>

          <div className="empdash-grid">
            {/* Leave */}
            <button
              className={`empdash-card ${
                leaveLocked ? "empdash-card-locked" : ""
              }`}
              onClick={() => handleModuleClick("leave")}
            >
              <div className="empdash-card-header">
                <span className="empdash-card-icon">📝</span>
                <h3>Leave Application</h3>
              </div>
              <p>
                Apply for leaves and track approval status.
              </p>
              <p className="empdash-card-pending">
                Pending applications:{" "}
                {pendingLeave === null ? "-" : pendingLeave}
              </p>
              <div className="empdash-card-footer">
                <span>
                  {leaveLocked ? "Limit reached" : "Open Leave Module"}
                </span>
                <span className="empdash-card-arrow">➜</span>
              </div>
            </button>

            {/* TA */}
            <button
              className={`empdash-card ${
                taLocked ? "empdash-card-locked" : ""
              }`}
              onClick={() => handleModuleClick("ta")}
            >
              <div className="empdash-card-header">
                <span className="empdash-card-icon">🚆</span>
                <h3>TA Application</h3>
              </div>
              <p>
                Submit travel allowance claims for official journeys.
              </p>
              <p className="empdash-card-pending">
                Pending applications: {pendingTa === null ? "-" : pendingTa}
              </p>
              <div className="empdash-card-footer">
                <span>{taLocked ? "Limit reached" : "Open TA Module"}</span>
                <span className="empdash-card-arrow">➜</span>
              </div>
            </button>

            {/* DA */}
            <button
              className={`empdash-card ${
                daLocked ? "empdash-card-locked" : ""
              }`}
              onClick={() => handleModuleClick("da")}
            >
              <div className="empdash-card-header">
                <span className="empdash-card-icon">🍽️</span>
                <h3>DA Application</h3>
              </div>
              <p>
                Daily allowance for duty tours and official visits.
              </p>
              <p className="empdash-card-pending">
                Pending applications: {pendingDa === null ? "-" : pendingDa}
              </p>
              <div className="empdash-card-footer">
                <span>{daLocked ? "Limit reached" : "Open DA Module"}</span>
                <span className="empdash-card-arrow">➜</span>
              </div>
            </button>

            {/* LTC */}
            <button
              className={`empdash-card ${
                ltcLocked ? "empdash-card-locked" : ""
              }`}
              onClick={() => handleModuleClick("ltc")}
            >
              <div className="empdash-card-header">
                <span className="empdash-card-icon">✈️</span>
                <h3>LTC Application</h3>
              </div>
              <p>
                Apply for Leave Travel Concession as per rules.
              </p>
              <p className="empdash-card-pending">
                Pending applications: {pendingLtc === null ? "-" : pendingLtc}
              </p>
              <div className="empdash-card-footer">
                <span>{ltcLocked ? "Limit reached" : "Open LTC Module"}</span>
                <span className="empdash-card-arrow">➜</span>
              </div>
            </button>
          </div>
        </section>

        {/* Overview strip */}
        <section className="empdash-section">
          <h2>Overview</h2>
          <div className="empdash-info-strip">
            <div className="empdash-info-item">
              <span className="empdash-info-label">Employee ID</span>
              <span className="empdash-info-value">
                {empId || "Not available"}
              </span>
            </div>
            <div className="empdash-info-item">
              <span className="empdash-info-label">Department</span>
              <span className="empdash-info-value">
                {department || "Not specified"}
              </span>
            </div>
            <div className="empdash-info-item">
              <span className="empdash-info-label">Designation</span>
              <span className="empdash-info-value">
                {designation || "Not specified"}
              </span>
            </div>
            <div className="empdash-info-item">
              <span className="empdash-info-label">Role</span>
              <span className="empdash-info-value">
                {role || "Employee"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
