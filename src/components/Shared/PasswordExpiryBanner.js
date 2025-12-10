import React, { useEffect, useState } from "react";
import "./PasswordExpiryBanner.css";

function PasswordExpiryBanner() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch (e) {
      console.error("Error reading userInfo from localStorage", e);
    }
  }, []);

  if (!user) return null;

  const { passwordExpiringSoon, daysToPasswordExpiry } = user;

  // Only show warning when backend says it's in last 7 days
  if (!passwordExpiringSoon) return null;

  const days = daysToPasswordExpiry ?? "few";

  return (
    <div className="pwd-banner">
      <span className="pwd-banner-title">Password Expiry Notice</span>
      <span className="pwd-banner-text">
        Your password will expire in {days} day{days === 1 ? "" : "s"}.{" "}
        Please change your password from the{" "}
        <strong>Change Password</strong> page to avoid account lock.
      </span>
    </div>
  );
}

export default PasswordExpiryBanner;
