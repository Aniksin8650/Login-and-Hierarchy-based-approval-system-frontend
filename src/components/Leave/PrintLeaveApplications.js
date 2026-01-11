import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PrintLeaveApplications.css";

function PrintLeaveApplications() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide global header/footer (supports multiple layouts)
    const possibleHeaders = [
      "header",
      ".header",
      ".navbar",
      ".topbar",
      ".main-header",
      ".app-header",
    ];

    const possibleFooters = [
      "footer",
      ".footer",
      ".main-footer",
      ".app-footer",
    ];

    possibleHeaders.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) el.style.display = "none";
    });

    possibleFooters.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) el.style.display = "none";
    });

    // Fetch data
    axios
      .get("http://localhost:8080/api/leave/all")
      .then((res) => {
        setLeaves(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leave applications:", err);
        setLoading(false);
      });

    // Restore on unmount
    return () => {
      possibleHeaders.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) el.style.display = "";
      });

      possibleFooters.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) el.style.display = "";
      });
    };
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div className="print-container">
      {/* ✅ Your own report header (kept) */}
      <div className="report-header">
        <h2>Leave Application Report for</h2>
        <p>Generated on: {new Date().toLocaleString()}</p>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Directorate</th>
            <th>Division</th>
            <th>Reason</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Contact</th>
            <th>Attached Files</th>
            <th>Type</th>
          </tr>
        </thead>

        <tbody>
          {leaves.map((l, index) => (
            <tr key={index}>
              <td>{l.id?.empId || "-"}</td>
              <td>{l.name}</td>
              <td>{l.directorate}</td>
              <td>{l.division}</td>
              <td>{l.reason}</td>

              {/* ✅ Date display with fallbacks */}
              <td>{l.id?.startDate || l.startDate || "-"}</td>
              <td>{l.id?.endDate || l.endDate || "-"}</td>

              <td>{l.contact}</td>
              <td>{l.fileName || "-"}</td>
              <td>{l.applicationType}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="print-btn" onClick={() => window.print()}>
        🖨️ Print / Save as PDF
      </button>
    </div>
  );
}

export default PrintLeaveApplications;
