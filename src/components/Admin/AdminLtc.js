import React from "react";
import AdminNavbar from "./AdminNavbar";
import Footer from "../Shared/Footer";
import "./AdminDashboard.css";

const AdminLtc = () => {
  return (
    <div>
      <AdminNavbar />
      <div className="admin-dashboard">
        <h2>LTC Requests</h2>
        <p>Here admin can manage Leave Travel Concession requests.</p>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLtc;
