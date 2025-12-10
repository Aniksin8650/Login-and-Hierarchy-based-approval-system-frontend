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

  // Password policy info from userInfo
  const [passwordExpiringSoon, setPasswordExpiringSoon] = useState(false);
  const [daysToPasswordExpiry, setDaysToPasswordExpiry] = useState(null);
  const [lastPasswordChangeDate, setLastPasswordChangeDate] = useState("");

  // Security tab: change password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityMessageType, setSecurityMessageType] = useState("info");
  const [securityLoading, setSecurityLoading] = useState(false);

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

      setPasswordExpiringSoon(!!u.passwordExpiringSoon);
      setDaysToPasswordExpiry(
        u.daysToPasswordExpiry !== undefined ? u.daysToPasswordExpiry : null
      );
      setLastPasswordChangeDate(u.lastPasswordChangeDate || "");
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

  // Change password from Security tab (inline, no navigation)
  const handleChangePassword = async () => {
    setSecurityMessage("");
    setSecurityMessageType("info");

    if (!empId) {
      setSecurityMessageType("error");
      setSecurityMessage("Employee ID not found. Please login again.");
      return;
    }

    if (!currentPassword) {
      setSecurityMessageType("error");
      setSecurityMessage("Please enter your current password.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setSecurityMessageType("error");
      setSecurityMessage("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setSecurityMessageType("error");
      setSecurityMessage("New password and confirm password do not match.");
      return;
    }

    setSecurityLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empId: empId,
          oldPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        if (res.status === 404) {
          setSecurityMessageType("error");
          setSecurityMessage("Employee not found. Please login again.");
        } else if (res.status === 401) {
          setSecurityMessageType("error");
          setSecurityMessage("Current password is incorrect.");
        } else {
          setSecurityMessageType("error");
          setSecurityMessage(text || "Password change failed.");
        }
        setSecurityLoading(false);
        return;
      }

      // success
      setSecurityMessageType("success");
      setSecurityMessage(text || "Password changed successfully.");

      // clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      // locally mark password as non-expiring (next login will refresh exact data)
      setPasswordExpiringSoon(false);
      setDaysToPasswordExpiry(null);

      // Set local "last changed" date string for UI (dd/MM/yyyy)
      const todayStr = new Date().toLocaleDateString("en-GB");
      setLastPasswordChangeDate(todayStr);

      // also update localStorage userInfo
      try {
        const stored = localStorage.getItem("userInfo");
        if (stored) {
          const u = JSON.parse(stored);
          const updated = {
            ...u,
            passwordExpiringSoon: false,
            daysToPasswordExpiry: null,
            lastPasswordChangeDate: todayStr,
          };
          localStorage.setItem("userInfo", JSON.stringify(updated));
        }
      } catch (e) {
        console.error("Failed to update userInfo after password change", e);
      }
    } catch (err) {
      console.error("Change password error:", err);
      setSecurityMessageType("error");
      setSecurityMessage("Server error during password change.");
    }

    setSecurityLoading(false);
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

            {lastPasswordChangeDate && (
              <p className="settings-password-last-change">
                Last password change: <strong>{lastPasswordChangeDate}</strong>
              </p>
            )}

            <div
              className={`settings-password-status ${
                passwordExpiringSoon
                  ? "settings-password-status-warning"
                  : "settings-password-status-ok"
              }`}
            >
              <div className="settings-password-status-left">
                <span className="settings-password-dot" />
                <div>
                  <div className="settings-password-status-title">
                    {passwordExpiringSoon
                      ? `Password expires in ${
                          daysToPasswordExpiry ?? "few"
                        } day${
                          daysToPasswordExpiry === 1 ? "" : "s"
                        }`
                      : "Password is active"}
                  </div>
                  <div className="settings-password-status-subtitle">
                    {lastPasswordChangeDate
                      ? `Last changed on ${lastPasswordChangeDate}. `
                      : ""}
                    Passwords expire every 3 months. You can change your
                    password any time below.
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-field">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="settings-field-grid">
              <div className="settings-field">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>

            {securityMessage && (
              <p
                className={
                  "settings-info-text " +
                  (securityMessageType === "success"
                    ? "settings-info-text-success"
                    : "settings-info-text-error")
                }
              >
                {securityMessage}
              </p>
            )}

            <button
              className="settings-btn-primary"
              onClick={handleChangePassword}
              disabled={securityLoading}
            >
              {securityLoading ? "Changing Password..." : "Change Password"}
            </button>

            <div className="settings-toggle-list" style={{ marginTop: "16px" }}>
              <label className="settings-toggle">
                <input type="checkbox" />
                <span className="settings-toggle-indicator" />
                <span>Enable two-factor authentication (2FA)</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Banner text for the top of the page
  const showPasswordBanner = !!empId; // show for any logged in user
  const bannerTitle = passwordExpiringSoon
    ? `Your password will expire in ${daysToPasswordExpiry ?? "few"} day${
        daysToPasswordExpiry === 1 ? "" : "s"
      }.`
    : "Your password is currently active.";

  const bannerSubtitle = lastPasswordChangeDate
    ? `Last changed on ${lastPasswordChangeDate}. Passwords will expire every 3 months. You will be reminded in the last 7 days.`
    : "Passwords will expire every 3 months. You will be reminded in the last 7 days.";

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

        {/* Password status banner */}
        {showPasswordBanner && (
          <div
            className={`settings-password-banner ${
              passwordExpiringSoon
                ? "settings-password-banner-warning"
                : "settings-password-banner-ok"
            }`}
          >
            <div className="settings-password-banner-left">
              <span className="settings-password-dot" />
              <div className="settings-password-banner-text">
                <div className="settings-password-banner-title">
                  {bannerTitle}
                </div>
                <div className="settings-password-banner-subtitle">
                  {bannerSubtitle}
                </div>
              </div>
            </div>
            <button
              className="settings-btn-secondary"
              onClick={() => setActiveTab("Security")}
            >
              Go to Security
            </button>
          </div>
        )}

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
