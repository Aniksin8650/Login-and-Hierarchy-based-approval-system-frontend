import React from "react";
import AdminNavbar from "./AdminNavbar";
import Footer from "../Shared/Footer";
import "./AdminDashboard.css";

const AdminOther = () => {
  return (
    <div>
      <AdminNavbar />
      <div className="admin-dashboard">
        <h2>Other Requests</h2>
        <p>Here admin can manage miscellaneous employee requests.</p>
      </div>
      <Footer />
    </div>
  );
};

export default AdminOther;
