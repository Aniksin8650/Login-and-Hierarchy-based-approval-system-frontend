import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about">
      {/* Background glow */}
      <div className="about-bg-circle about-bg-1"></div>
      <div className="about-bg-circle about-bg-2"></div>

      <div className="about-container">
        {/* Header */}
        <header className="about-header">
          <p className="about-badge">Information</p>
          <h1>About This Project</h1>
          <p className="about-subtitle">
            A unified portal to manage leave, TA/DA, and LTC workflows for both
            employees and administrators.
          </p>
        </header>

        {/* Overview + Tech Stack */}
        <section className="about-grid">
          <div className="about-card">
            <h2>Overview</h2>
            <p>
              This Employee Management Portal streamlines day-to-day operations
              such as <strong>Leave</strong>, <strong>TA</strong>,{" "}
              <strong>DA</strong>, and <strong>LTC</strong> handling. Employees
              can submit applications in a guided flow, while administrators
              review, track, approve, or reject requests from a centralized
              dashboard.
            </p>
            <p>
              Role-based navigation ensures that admins and employees see
              different dashboards, menus, and actions tailored to their
              responsibilities.
            </p>
          </div>

          <div className="about-card">
            <h2>Technology Stack</h2>
            <ul>
              <li>
                <strong>Frontend:</strong> React.js (SPA) with modern UI styling
              </li>
              <li>
                <strong>Backend:</strong> Spring Boot REST APIs
              </li>
              <li>
                <strong>Database:</strong> MySQL / PostgreSQL (configurable)
              </li>
              <li>
                <strong>Auth:</strong> JWT-based secure login with role-based
                access
              </li>
              <li>
                <strong>Print Support:</strong> Printable leave records and
                reports
              </li>
            </ul>
          </div>
        </section>

        {/* Core Features */}
        <section className="about-section">
          <h2>Core Features</h2>
          <div className="about-feature-grid">
            <div className="about-feature-card">
              <h3>Employee Dashboard</h3>
              <p>
                A clean panel for employees to apply for Leave, TA, DA, and LTC
                and track the status of their applications.
              </p>
            </div>
            <div className="about-feature-card">
              <h3>Admin Dashboard</h3>
              <p>
                Separate admin view for applying on behalf of self and handling
                employee requests via Apply and Requests portals.
              </p>
            </div>
            <div className="about-feature-card">
              <h3>Role-Aware Navigation</h3>
              <p>
                Dynamic header and navigation based on whether the user is an
                admin, employee, or a visitor.
              </p>
            </div>
            <div className="about-feature-card">
              <h3>Printable Records</h3>
              <p>
                Support to view and print leave records in a structured format
                for office documentation.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-section">
          <h2>The Team</h2>
          <p className="about-section-subtitle">
            A small but focused team working on making office workflows less
            painful and more organized.
          </p>
          <div className="about-team-grid">
            <div className="about-team-card">
              <div className="about-avatar">A</div>
              <h3>Project Developer</h3>
              <p>
                Handles frontend in React.js and backend integration with Spring
                Boot, building features and fixing bugs.
              </p>
            </div>
            <div className="about-team-card">
              <div className="about-avatar">T</div>
              <h3>Technical Reviewer</h3>
              <p>
                Reviews flows, suggests improvements in UX and validates the
                overall structure and usability of the system.
              </p>
            </div>
            <div className="about-team-card">
              <div className="about-avatar">A</div>
              <h3>Admin / Domain Expert</h3>
              <p>
                Provides real-world workflow rules, approval processes and
                ensures the portal matches office requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="about-section">
          <h2>Project Timeline</h2>
          <div className="about-timeline">
            <div className="about-timeline-item">
              <div className="about-timeline-dot" />
              <div className="about-timeline-content">
                <h3>2025 — Initial Design</h3>
                <p>
                  Defined modules for Leave, TA, DA and LTC along with admin
                  and employee workflows.
                </p>
              </div>
            </div>
            <div className="about-timeline-item">
              <div className="about-timeline-dot" />
              <div className="about-timeline-content">
                <h3>Implementation & Integration</h3>
                <p>
                  React frontend integrated with Spring Boot backend APIs and
                  database, including authentication and role mapping.
                </p>
              </div>
            </div>
            <div className="about-timeline-item">
              <div className="about-timeline-dot" />
              <div className="about-timeline-content">
                <h3>Refinement & UI Polish</h3>
                <p>
                  Improved dashboard layouts, added separate headers for admin
                  and employee, and refined print and navigation flows.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="about-section">
          <h2>FAQ</h2>
          <div className="about-faq-grid">
            <div className="about-faq-item">
              <h3>Who can access the Admin Dashboard?</h3>
              <p>
                Only users with the admin role after login are redirected to the
                Admin Dashboard. Regular users are sent to the Employee
                Dashboard.
              </p>
            </div>
            <div className="about-faq-item">
              <h3>Can employees see admin options?</h3>
              <p>
                No. The navigation, routes, and header are role-aware. Admin
                links like Apply and Requests are not shown to standard
                employees.
              </p>
            </div>
            <div className="about-faq-item">
              <h3>Is it possible to extend modules?</h3>
              <p>
                Yes. New modules or request types can be added with additional
                routes, components, and backend endpoints.
              </p>
            </div>
            <div className="about-faq-item">
              <h3>Can leave records be exported?</h3>
              <p>
                The portal supports printable views. Export (CSV/PDF) can be
                added on top of the current print functionality if required.
              </p>
            </div>
          </div>
        </section>

        {/* Credits */}
        <section className="about-section about-section-credits">
          <h2>Credits</h2>
          <p className="about-credits-text">
            Designed and developed as a structured project to manage real-world
            office scenarios around leave and travel workflows. Built with care
            using React.js and Spring Boot, with a focus on clean UI,
            separation of concerns, and extendable architecture.
          </p>
          <p className="about-version">Version: 1.0.0</p>
        </section>
      </div>
    </div>
  );
};

export default About;
