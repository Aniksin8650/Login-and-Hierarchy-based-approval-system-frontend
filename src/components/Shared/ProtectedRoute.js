import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../../utils/tokenUtils";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token || isTokenExpired()) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Role-number-based protection
  if (allowedRoles) {
    const roleNo = user?.activeRole?.roleNo;

    // allow only approval roles (roleNo < 100)
    if (!roleNo || roleNo >= 100) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;