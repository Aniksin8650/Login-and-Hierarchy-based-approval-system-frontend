import React from "react";
import AdminNavbar from "./AdminNavbar";
import Footer from "../Shared/Footer";
import "./AdminDashboard.css";

const AdminTada = () => {
  return (
    <div>
      <AdminNavbar />
      <div className="admin-dashboard">
        <h2>TADA Requests</h2>
        <p>Here admin can review TADA (Travel Allowance) requests.</p>
      </div>
      <Footer />
    </div>
  );
};

export default AdminTada;
