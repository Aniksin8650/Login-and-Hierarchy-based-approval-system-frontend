import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

// Build EMP ID like EMP001
const buildEmpId = (digits) => {
  const clean = (digits || "").replace(/\D/g, "");
  if (!clean) return "";
  return "EMP" + clean.padStart(3, "0").slice(-3);
};

function Login() {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  // Theme
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  // Role popup
  const [roles, setRoles] = useState([]);
  const [primaryRole, setPrimaryRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRolePopup, setShowRolePopup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const showToast = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedEmpId = buildEmpId(empId);
    if (!formattedEmpId) {
      showToast("Please enter Employee ID", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empId: formattedEmpId,
          password,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        showToast(text || "Login failed", "error");
        setLoading(false);
        return;
      }

      const user = JSON.parse(text);
      localStorage.setItem("userInfo", JSON.stringify(user));

      showToast(`Welcome ${user.name}!`, "success");

      const fetchedRoles = user.roles || [];
      const backendPrimary = user.primaryRole || null;

      setRoles(fetchedRoles);
      setPrimaryRole(backendPrimary);

      // 🔥 Auto-select PRIMARY role
      if (backendPrimary) {
        setSelectedRole(backendPrimary);
      } else if (fetchedRoles.length === 1) {
        setSelectedRole(fetchedRoles[0]);
      } else {
        setSelectedRole(null);
      }

      setShowRolePopup(true);
      setLoading(false);
    } catch {
      showToast("Server error during login", "error");
      setLoading(false);
    }
  };

  const closeRolePopup = () => {
    setShowRolePopup(false);
    setSelectedRole(null);
  };

  const confirmRoleLogin = () => {
    if (!selectedRole) {
      showToast("Please select a role", "error");
      return;
    }

    const baseUser = JSON.parse(localStorage.getItem("userInfo"));
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...baseUser,
        activeRole: selectedRole,   // 🔥 THIS is what backend approvals will use
      })
    );

    setShowRolePopup(false);
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      {/* Theme Toggle */}
      <button
        className="theme-toggle"
        onClick={() =>
          setTheme(theme === "light" ? "dark" : "light")
        }
        title="Toggle theme"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      {message && (
        <div className={`toast toast-${messageType}`}>{message}</div>
      )}

      <div className="auth-card">
        <div className="auth-left">
          <div className="auth-logo-circle">
            <span>AF</span>
          </div>
          <h1 className="auth-title">AttachFile Portal</h1>
          <p className="auth-subtitle">
            Secure access to Leave, TA, DA, and LTC modules.
          </p>
        </div>

        <div className="auth-right">
          <div className="login-container">
            <h2>Login</h2>

            <form className="login-form" onSubmit={handleLogin}>
              <label>Employee ID</label>

              <div className="empid-input">
                <span className="empid-prefix">EMP-</span>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) =>
                    setEmpId(e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  placeholder="001"
                  maxLength={3}
                  required
                />
              </div>

              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="register-link">
                Not registered? <Link to="/register">Register</Link>
              </div>

              <div className="change-password-link">
                <Link to="/change-password">Change Password</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ===== ROLE POPUP ===== */}
      {showRolePopup && (
        <div className="role-modal-overlay">
          <div className="role-modal">
            <button
              className="role-modal-close"
              onClick={closeRolePopup}
              title="Change Employee ID"
            >
              ✕
            </button>

            <h3>Select Role</h3>

            {roles.map((r, idx) => {
              const isPrimary =
                primaryRole &&
                r.roleNo === primaryRole.roleNo &&
                r.dte === primaryRole.dte &&
                r.div === primaryRole.div;

              const checked =
                selectedRole &&
                r.roleNo === selectedRole.roleNo &&
                r.dte === selectedRole.dte &&
                r.div === selectedRole.div;

              return (
                <label
                  key={idx}
                  className={`role-option ${
                    isPrimary ? "primary-role" : "secondary-role"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={checked}
                    onChange={() => setSelectedRole(r)}
                  />

                  <div>
                    <strong>
                      {r.roleName}
                      {isPrimary && " ⭐"}
                    </strong>

                    <div className="role-sub">
                      {r.dte} → {r.div}
                    </div>

                    {isPrimary ? (
                      <div className="role-tag primary">PRIMARY</div>
                    ) : (
                      <div className="role-tag secondary">SECONDARY</div>
                    )}
                  </div>
                </label>
              );
            })}

            <button className="login-btn" onClick={confirmRoleLogin}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
