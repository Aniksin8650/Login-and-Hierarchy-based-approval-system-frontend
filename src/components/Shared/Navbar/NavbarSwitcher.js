import React from "react";
import { useLocation } from "react-router-dom";
import EmployeeNavbar from "./EmployeeNavbar";
import PublicNavbar from "./PublicNavbar";

const PUBLIC_ROUTES = ["/login", "/register", "/change-password"];

const NavbarSwitcher = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const isPublicRoute = PUBLIC_ROUTES.some((path) =>
    location.pathname.startsWith(path)
  );

  // 🔹 Public pages ALWAYS get public navbar
  if (isPublicRoute) {
    return <PublicNavbar />;
  }

  // 🔹 Logged-in users get employee navbar
  if (user) {
    return <EmployeeNavbar />;
  }

  // 🔹 Fallback (not logged in but not public route)
  return <PublicNavbar />;
};

export default NavbarSwitcher;
