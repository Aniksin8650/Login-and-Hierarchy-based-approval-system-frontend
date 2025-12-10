import React from "react";
import { useLocation } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";
import EmployeeNavbar from "./EmployeeNavbar";
import AdminNavbar from "./AdminNavbar";

const NavbarSwitcher = () => {
  const location = useLocation();
  const path = location.pathname || "/";

  const isAdminMode = path.startsWith("/admin");
  const isEmployeeMode =
    !isAdminMode &&
    (path.startsWith("/employee") ||
      path.startsWith("/dashboard") ||
      path.startsWith("/leave-application") ||
      path.startsWith("/TA-application") ||
      path.startsWith("/DA-application") ||
      path.startsWith("/LTC-application") ||
      path.startsWith("/print-leaves") ||
      path.startsWith("/settings") ||
      path.startsWith("/change-password"));

  if (isAdminMode) return <AdminNavbar />;
  if (isEmployeeMode) return <EmployeeNavbar />;
  return <PublicNavbar />;
};

export default NavbarSwitcher;
