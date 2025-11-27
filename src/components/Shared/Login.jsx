import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  const navigate = useNavigate();

  const showToast = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empId, password, role }),
      });

      const text = await res.text();

      if (!res.ok) {
        if (res.status === 404) {
          showToast("Employee ID not found. Please check or register.", "error");
        } else if (res.status === 400 && text.includes("not registered")) {
          showToast("Employee is not registered. Please register first.", "error");
        } else if (res.status === 401) {
          showToast("Invalid password.", "error");
        } else if (res.status === 403) {
          showToast("Role mismatch. Please select correct role.", "error");
        } else {
          showToast(text || "Login failed", "error");
        }
        setLoading(false);
        return;
      }

      const user = JSON.parse(text);

      // 🔹 Store login response for Dashboard + Settings
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user)); // optional

      showToast(`Welcome ${user.name}!`, "success");

      if (user.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      showToast("Server error during login", "error");
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">
      {message && (
        <div className={`toast toast-${messageType}`}>
          {message}
        </div>
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
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="Enter Employee ID"
                required
              />

              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
              />

              <label>Select Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="role-select"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="register-link">
                Not registered?{" "}
                <Link to="/register">Click here to register</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
