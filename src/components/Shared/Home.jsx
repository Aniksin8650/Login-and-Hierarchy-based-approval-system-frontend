import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      {/* Background decoration */}
      <div className="home-bg-circle home-bg-circle-1"></div>
      <div className="home-bg-circle home-bg-circle-2"></div>

      <div className="home-content">
        <section className="home-hero">
          <div className="home-hero-text">
            <h1 className="home-title">
              Unified Leave & Travel <span>Management</span> Portal
            </h1>
            <p className="home-subtitle">
              Apply, track, and approve leave and TA/DA/LTC requests in a
              single, streamlined dashboard for employees and admins.
            </p>

            <div className="home-cta">
              <Link to="/login" className="home-btn home-btn-primary">
                Login
              </Link>
              <Link to="/register" className="home-btn home-btn-secondary">
                Register
              </Link>
            </div>

            <div className="home-pill-row">
              <div className="home-pill">Employee Dashboard</div>
              <div className="home-pill">Admin Approvals</div>
              <div className="home-pill">Real-time Tracking</div>
            </div>
          </div>

          <div className="home-hero-card">
            <div className="home-stat-card">
              <h3>4 Modules</h3>
              <p>Leave, TA, DA & LTC in one place.</p>
            </div>
            <div className="home-stat-grid">
              <div className="home-stat-item">
                <span className="home-stat-label">Role-based</span>
                <span className="home-stat-value">Admin / Employee</span>
              </div>
              <div className="home-stat-item">
                <span className="home-stat-label">Workflow</span>
                <span className="home-stat-value">Apply → Review</span>
              </div>
              <div className="home-stat-item">
                <span className="home-stat-label">Print</span>
                <span className="home-stat-value">Leave Records</span>
              </div>
              <div className="home-stat-item">
                <span className="home-stat-label">Secure</span>
                <span className="home-stat-value">User Login</span>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section">
          <h2>How it works</h2>
          <div className="home-steps">
            <div className="home-step">
              <div className="home-step-number">1</div>
              <h3>Login or Register</h3>
              <p>
                Start by logging in with your credentials or create a new
                account as an employee.
              </p>
            </div>

            <div className="home-step">
              <div className="home-step-number">2</div>
              <h3>Dashboard based on role</h3>
              <p>
                Admins land on the Admin Dashboard. Employees land on their
                Employee Dashboard with 4 modules.
              </p>
            </div>

            <div className="home-step">
              <div className="home-step-number">3</div>
              <h3>Apply & Track</h3>
              <p>
                Employees apply for Leave/TA/DA/LTC. Admins manage requests and
                approvals in a structured view.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
