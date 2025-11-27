import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [empId, setEmpId] = useState("");
  const [name, setName] = useState("User");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

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
      }
    } catch (err) {
      console.error("Failed to read user info", err);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  return (
    <div className="empdash">
      <div className="empdash-bg-circle empdash-bg-1" />
      <div className="empdash-bg-circle empdash-bg-2" />

      <div className="empdash-container">
        {/* Header */}
        <header className="empdash-header">
          <div>
            <p className="empdash-badge">Employee Portal</p>
            <h1>
              Welcome{loadingUser ? "" : `, ${name}`}
            </h1>
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

          <div className="empdash-profile-card">
            <div className="empdash-avatar">
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="empdash-profile-info">
              <p className="empdash-profile-name">{name}</p>
              <p className="empdash-profile-meta">
                {role || "Employee"} {empId ? `• ID: ${empId}` : ""}
              </p>
              {email && (
                <p className="empdash-profile-email">{email}</p>
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
            <button
              className="empdash-card"
              onClick={() => navigate("/leave-application")}
            >
              <div className="empdash-card-header">
                <span className="empdash-card-icon">📝</span>
                <h3>Leave Application</h3>
              </div>
              <p>
                Apply for different types of leave with proper dates and
                reasons, and track approval status.
              </p>
              <div className="empdash-card-footer">
                <span>Open Leave Module</span>
                <span className="empdash-card-arrow">➜</span>
              </div>
            </button>

            <button
              className="empdash-card"
              onClick={() => navigate("/TA-application")}
            >
              <div className="empdash-card-header">
                <span className="empdash-card-icon">🚆</span>
                <h3>TA Application</h3>
              </div>
              <p>
                Submit travel allowance claims for official journeys with
                distance and fare details.
              </p>
              <div className="empdash-card-footer">
                <span>Open TA Module</span>
                <span className="empdash-card-arrow">➜</span>
              </div>
            </button>

            <button
              className="empdash-card"
              onClick={() => navigate("/DA-application")}
            >
              <div className="empdash-card-header">
                <span className="empdash-card-icon">🍽️</span>
                <h3>DA Application</h3>
              </div>
              <p>
                Request daily allowance for duty tours, meetings and outstation
                office work.
              </p>
              <div className="empdash-card-footer">
                <span>Open DA Module</span>
                <span className="empdash-card-arrow">➜</span>
              </div>
            </button>

            <button
              className="empdash-card"
              onClick={() => navigate("/LTC-application")}
            >
              <div className="empdash-card-header">
                <span className="empdash-card-icon">✈️</span>
                <h3>LTC Application</h3>
              </div>
              <p>
                Apply for Leave Travel Concession as per rules and record all
                journey details.
              </p>
              <div className="empdash-card-footer">
                <span>Open LTC Module</span>
                <span className="empdash-card-arrow">➜</span>
              </div>
            </button>
          </div>
        </section>

        {/* Overview / info strip */}
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
