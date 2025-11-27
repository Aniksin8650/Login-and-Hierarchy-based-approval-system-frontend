import React, { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import Footer from "../Shared/Footer";
import "./AdminDashboard.css";
import "./AdminLeave.css"; // new css for layout and styling

const AdminLeave = () => {
  // demo requests
  const [requests, setRequests] = useState([
    {
      id: 1,
      empName: "Ravi Kumar",
      empId: "EMP001",
      fromDate: "2025-10-05",
      toDate: "2025-10-10",
      reason: "Medical leave",
      status: "pending",
    },
    {
      id: 2,
      empName: "Priya Sharma",
      empId: "EMP002",
      fromDate: "2025-10-12",
      toDate: "2025-10-14",
      reason: "Family function",
      status: "pending",
    },
  ]);

  const [activeTab, setActiveTab] = useState("pending");

  // handle accept / reject
  const handleAction = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    );
  };

  const filteredRequests = requests.filter(
    (req) => req.status === activeTab
  );

  return (
    <div>
      <AdminNavbar />

      <div className="admin-leave-container">
        <h2 className="page-heading">Leave Requests</h2>

        {/* Tabs */}
        <div className="tab-buttons">
          <button
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => setActiveTab("pending")}
          >
            Requests
          </button>
          <button
            className={activeTab === "accepted" ? "active" : ""}
            onClick={() => setActiveTab("accepted")}
          >
            Accepted
          </button>
          <button
            className={activeTab === "rejected" ? "active" : ""}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected
          </button>
        </div>

        {/* Request List */}
        <div className="requests-section">
          {filteredRequests.length === 0 ? (
            <p className="no-requests">No {activeTab} requests.</p>
          ) : (
            filteredRequests.map((req) => (
              <div key={req.id} className="request-card">
                <div className="request-details">
                  <p><strong>Employee:</strong> {req.empName} ({req.empId})</p>
                  <p><strong>From:</strong> {req.fromDate} — <strong>To:</strong> {req.toDate}</p>
                  <p><strong>Reason:</strong> {req.reason}</p>
                </div>
                {req.status === "pending" && (
                  <div className="action-buttons">
                    <button
                      className="accept-btn"
                      onClick={() => handleAction(req.id, "accepted")}
                    >
                      ✅ Accept
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleAction(req.id, "rejected")}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLeave;
