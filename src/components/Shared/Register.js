import React, { useState } from "react";
import "./Register.css";

const buildEmpId = (digits) => {
  const clean = (digits || "").replace(/\D/g, "");
  if (!clean) return "";
  const padded = clean.padStart(3, "0").slice(-3);
  return "EMP" + padded;
};

function Register() {
  const [empId, setEmpId] = useState(""); // only digits like "2", "12", "007"
  const [employeeData, setEmployeeData] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchEmployee = async () => {
    const fullId = buildEmpId(empId).trim();
    if (!fullId) {
      setEmployeeData(null);
      showToast("Please enter Employee ID", "error");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/employees/id/${fullId}`
      );
      if (!res.ok) {
        setEmployeeData(null);
        showToast("Employee not found", "error");
        return;
      }
      const data = await res.json();
      setEmployeeData(data);
      showToast("Employee details loaded", "success");
    } catch (err) {
      console.error("Fetch employee error:", err);
      showToast("Server error while fetching employee", "error");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!employeeData) {
      showToast("Please fetch employee details first", "error");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    const fullId = buildEmpId(empId);
    if (!fullId) {
      showToast("Please enter Employee ID", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empId: fullId, password: newPassword }),
      });

      const text = await res.text();

      if (!res.ok) {
        showToast(text || "Registration failed", "error");
      } else {
        showToast(text || "Registration successful!", "success");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Register error:", err);
      showToast("Server error during registration", "error");
    }
    setLoading(false);
  };

  return (
    <div className="register-page">
      {message && (
        <div className={`toast toast-${messageType}`}>{message}</div>
      )}

      <div className="register-card">
        <div className="register-left">
          <div className="auth-logo-circle">
            <span>AF</span>
          </div>
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">
            Link your employee profile and set your password to access all
            modules.
          </p>
        </div>

        <div className="register-right">
          <h2>Register</h2>

          <form className="register-form" onSubmit={handleRegister}>
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
              <button
                type="button"
                className="fetch-btn"
                onClick={fetchEmployee}
              >
                Fetch
              </button>
            </div>

            {employeeData && (
              <div className="employee-preview">
                <p>
                  <strong>Name:</strong> {employeeData.name}
                </p>
                <p>
                  <strong>Department:</strong> {employeeData.department}
                </p>
                <p>
                  <strong>Designation:</strong> {employeeData.designation}
                </p>
                <p>
                  <strong>Phone:</strong> {employeeData.phone}
                </p>
                <p>
                  <strong>Role:</strong> {employeeData.role}
                </p>
              </div>
            )}

            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />

            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
