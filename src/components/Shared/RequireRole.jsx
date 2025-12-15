import React from "react";
import { Navigate } from "react-router-dom";

const RequireRole = ({ allowedRoles, children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.activeRole?.roleName;

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but role not allowed
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RequireRole;
