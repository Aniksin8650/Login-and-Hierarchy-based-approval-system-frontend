import React, { useState, useEffect } from "react";
import "./Settings.css";

const TABS = ["General", "Notifications", "Privacy", "Display", "Security"];

const Settings = () => {
  const [activeTab, setActiveTab] = useState("General");

  // ---- User profile fields (from LoginResponse) ----
  const [empId, setEmpId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [profileMessage, setProfileMessage] = useState("");

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (!stored) {
        setProfileMessage("No user data found. Please login again.");
        return;
      }

      const u = JSON.parse(stored);

      setEmpId(u.empId || "");
      setName(u.name || "");
      setDepartment(u.department || "");
      setDesignation(u.designation || "");
      setRole(u.role || "");
      setPhone(u.phone || "");
      setEmail(u.email || "");
    } catch (err) {
      console.error(err);
      setProfileMessage("Failed to load user details.");
    }
  }, []);

  // Save changes back to localStorage (frontend-only for now)
  const handleSaveGeneral = () => {
    try {
      const stored = localStorage.getItem("userInfo");
      const original = stored ? JSON.parse(stored) : {};

      const updated = {
        ...original,
        empId,
        name,
        department,
        designation,
        role,
        phone,
        email,
      };

      localStorage.setItem("userInfo", JSON.stringify(updated));
      setProfileMessage("Profile updated locally.");
    } catch (err) {
      console.error(err);
      setProfileMessage("Failed to update profile.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return (
          <div className="settings-card">
            <h2>General Settings</h2>
            <p className="settings-description">
              View and update your basic profile information used in the portal.
            </p>

            <div className="settings-field-grid">
              <div className="settings-field">
                <label>Employee ID</label>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  disabled // usually ID is not editable
                />
              </div>
              <div className="settings-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="settings-field-grid">
              <div className="settings-field">
                <label>Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled
                />
              </div>
              <div className="settings-field">
                <label>Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  disabled
                />
              </div>
            </div>

            <div className="settings-field-grid">
              <div className="settings-field">
                <label>Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled
                />
              </div>
              <div className="settings-field">
                <label>Phone</label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="settings-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {profileMessage && (
              <p className="settings-info-text">{profileMessage}</p>
            )}

            <button
              className="settings-btn-primary"
              onClick={handleSaveGeneral}
            >
              Save Changes
            </button>
          </div>
        );

      case "Notifications":
        return (
          <div className="settings-card">
            <h2>Notification Settings</h2>
            <p className="settings-description">
              Choose how you want to be notified about approvals and updates.
            </p>
            <div className="settings-toggle-list">
              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span className="settings-toggle-indicator" />
                <span>Email notifications</span>
              </label>
              <label className="settings-toggle">
                <input type="checkbox" />
                <span className="settings-toggle-indicator" />
                <span>SMS alerts</span>
              </label>
              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span className="settings-toggle-indicator" />
                <span>In-app notifications</span>
              </label>
            </div>
            <button className="settings-btn-primary">Update Preferences</button>
          </div>
        );

      case "Privacy":
        return (
          <div className="settings-card">
            <h2>Privacy Settings</h2>
            <p className="settings-description">
              Control how your information is visible to admins and other users.
            </p>
            <div className="settings-field">
              <label>Profile Visibility</label>
              <select>
                <option>Visible to admins only</option>
                <option>Visible within department</option>
                <option>Visible to all employees</option>
              </select>
            </div>
            <div className="settings-toggle-list">
              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span className="settings-toggle-indicator" />
                <span>Show leave history to admins</span>
              </label>
              <label className="settings-toggle">
                <input type="checkbox" />
                <span className="settings-toggle-indicator" />
                <span>Share contact details with team</span>
              </label>
            </div>
            <button className="settings-btn-primary">
              Save Privacy Settings
            </button>
          </div>
        );

      case "Display":
        return (
          <div className="settings-card">
            <h2>Display Settings</h2>
            <p className="settings-description">
              Customize the appearance of the portal for your account.
            </p>
            <div className="settings-field">
              <label>Theme</label>
              <div className="settings-theme-options">
                <button className="settings-theme-pill settings-theme-pill-active">
                  Dark
                </button>
                <button className="settings-theme-pill">Light</button>
                <button className="settings-theme-pill">System</button>
              </div>
            </div>
            <div className="settings-field-grid">
              <div className="settings-field">
                <label>Font Size</label>
                <select>
                  <option>Normal</option>
                  <option>Compact</option>
                  <option>Large</option>
                </select>
              </div>
              <div className="settings-field">
                <label>Density</label>
                <select>
                  <option>Comfortable</option>
                  <option>Compact</option>
                </select>
              </div>
            </div>
            <button className="settings-btn-primary">
              Apply Display Settings
            </button>
          </div>
        );

      case "Security":
        return (
          <div className="settings-card">
            <h2>Security Settings</h2>
            <p className="settings-description">
              Keep your account protected by updating your password and security
              options.
            </p>
            <div className="settings-field">
              <label>Current Password</label>
              <input type="password" placeholder="Enter current password" />
            </div>
            <div className="settings-field-grid">
              <div className="settings-field">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" />
              </div>
              <div className="settings-field">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Re-type new password" />
              </div>
            </div>
            <div className="settings-toggle-list">
              <label className="settings-toggle">
                <input type="checkbox" />
                <span className="settings-toggle-indicator" />
                <span>Enable two-factor authentication (2FA)</span>
              </label>
            </div>
            <button className="settings-btn-primary">Update Security</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-bg-circle settings-bg-1" />
      <div className="settings-bg-circle settings-bg-2" />

      <div className="settings-wrapper">
        <header className="settings-header">
          <p className="settings-badge">Preferences</p>
          <h1>Settings</h1>
          <p className="settings-subtitle">
            Manage your profile, notifications, privacy, display, and security
            options from a single place.
          </p>
        </header>

        <div className="settings-layout">
          {/* Sidebar */}
          <aside className="settings-sidebar">
            {TABS.map((item) => (
              <button
                key={item}
                className={`settings-tab ${
                  activeTab === item ? "settings-tab-active" : ""
                }`}
                onClick={() => setActiveTab(item)}
              >
                {item}
              </button>
            ))}
          </aside>

          {/* Content */}
          <main className="settings-content">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
