import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";            // reuse the login layout styles
import "./ChangePassword.css";   // small custom tweaks

// reuse same helper style
const buildEmpId = (digits) => {
  const clean = (digits || "").replace(/\D/g, "");
  if (!clean) return "";
  const padded = clean.padStart(3, "0").slice(-3);
  return "EMP" + padded;
};

function ChangePassword() {
  const [empId, setEmpId] = useState(""); // digits only
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const fullEmpId = buildEmpId(empId);
    if (!fullEmpId) {
      showToast("Please enter Employee ID", "error");
      return;
    }

    if (!oldPassword) {
      showToast("Please enter your current password", "error");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast("New password and confirm password do not match", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empId: fullEmpId,
          oldPassword,
          newPassword,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        if (res.status === 404) {
          showToast("Employee not found. Please check your Employee ID.", "error");
        } else if (res.status === 401) {
          showToast("Current password is incorrect", "error");
        } else {
          showToast(text || "Password change failed", "error");
        }
        setLoading(false);
        return;
      }

      showToast(text || "Password changed successfully", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error("Change password error:", err);
      showToast("Server error during password change", "error");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      {message && (
        <div className={`toast toast-${messageType}`}>{message}</div>
      )}

      <div className="auth-card">
        {/* Left side – same style as login, different text */}
        <div className="auth-left">
          <div className="auth-logo-circle">
            <span>AF</span>
          </div>
          <h1 className="auth-title">Change Password</h1>
          <p className="auth-subtitle">
            Update your password regularly to keep your account secure.
          </p>
        </div>

        {/* Right side – form */}
        <div className="auth-right">
          <div className="login-container">
            <h2>Change Password</h2>

            <form className="login-form" onSubmit={handleChangePassword}>
              <label>Employee ID</label>
              <div className="empid-row">
                <div className="empid-input">
                  <span className="empid-prefix">EMP-</span>
                  <input
                    type="text"
                    value={empId}
                    onChange={(e) =>
                      setEmpId(
                        e.target.value.replace(/\D/g, "").slice(0, 3)
                      )
                    }
                    placeholder="001"
                  />
                </div>
              </div>

              <label>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
              />

              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />

              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
              />

              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? "Changing..." : "Change Password"}
              </button>

              <div className="back-to-login-link">
                <Link to="/login">Back to Login</Link>
              </div>

              <div className="password-policy-note">
                Passwords will expire every 3 months. You will be reminded in the last 7 days.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
