import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import "../AdminDashboard.css";
import "./AdminLeaveRequests.css";
import "../AdminRequestsPortal.css";

const API_BASE = "http://localhost:8080";

/* ================= TAB DEFINITIONS ================= */

const TABS = {
  PENDING: "Requests",
  FORWARDED: "Forwarded",
  APPROVED: "Accepted",
  REJECTED: "Rejected",
  REJECTED_BY_HIGHER: "Rejected by Higher",
};

const AdminRequestsPage = ({
  title,
  baseUrl,        // e.g. /api/leave/approvals
  entityLabel,
  renderDetails,
  badgeText = "Requests",
  subtitle,
  backTo = "/dashboard/requests",
}) => {
  /* ================= USER CONTEXT ================= */

  const user = JSON.parse(localStorage.getItem("user"));
  const empId = user?.empId;
  const activeRole = user?.activeRole;          // 🔥 NEW
  const roleNo = activeRole?.roleNo;            // 🔥 NEW

  /* ================= STATE ================= */

  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remarks, setRemarks] = useState({});

  const getErrorMessage = (err, fallback) => {
    if (typeof err?.response?.data === "string") return err.response.data;
    if (err?.response?.data?.message) return err.response.data.message;
    return fallback;
  };

  /* ================= FETCH REQUESTS ================= */

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${API_BASE}${baseUrl}/pending-for-me`,
        { params: { empId } }
      );

      setRequests(res.data || []);
    } catch (err) {
      toast.error(
        getErrorMessage(err, `Failed to load ${entityLabel}. Please try again.`)
      );
    } finally {
      setLoading(false);
    }
  }, [baseUrl, empId, entityLabel]);

  useEffect(() => {
    if (empId) fetchRequests();
  }, [fetchRequests, empId]);

  /* ================= ACTION HANDLERS ================= */

  const handleApprove = async (applnNo) => {

    if (!roleNo) {
      toast.error("No active role selected. Please login again.");
      return;
    }

    try {
      await axios.post(`${API_BASE}${baseUrl}/${applnNo}/approve`, null, {
        params: {
          approverId: empId,
          roleNo: roleNo,                         // 🔥 FIX
          remarks: remarks[applnNo] || "",
        },
      });

      toast.success("Request approved successfully");
      fetchRequests();
    } catch (err) {
      toast.error(
        getErrorMessage(err, "You are not the correct approval authority")
      );
    }
  };

  const handleReject = async (applnNo) => {

    if (!roleNo) {
      toast.error("No active role selected. Please login again.");
      return;
    }

    try {
      await axios.post(`${API_BASE}${baseUrl}/${applnNo}/reject`, null, {
        params: {
          approverId: empId,
          roleNo: roleNo,                         // 🔥 FIX
          remarks: remarks[applnNo] || "",
        },
      });

      toast.success("Request rejected successfully");
      fetchRequests();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reject request"));
    }
  };

  /* ================= TAB FILTERING ================= */

  const filteredRequests = requests.filter((r) => {
    const { status, actedByMe, myAction, canAct } = r;

    if (activeTab === "PENDING") {
      return canAct === true;
    }

    if (activeTab === "FORWARDED") {
      return actedByMe && myAction === "APPROVED" && status === "IN_APPROVAL";
    }

    if (activeTab === "APPROVED") {
      return actedByMe && myAction === "APPROVED" && status === "APPROVED";
    }

    if (activeTab === "REJECTED") {
      return actedByMe && myAction === "REJECTED";
    }

    if (activeTab === "REJECTED_BY_HIGHER") {
      return actedByMe && myAction === "APPROVED" && status === "REJECTED";
    }

    return false;
  });

  /* ================= RENDER ================= */

  return (
    <div className="admin-req">
      {/* ===== HEADER ===== */}
      <div className="admin-req-header">
        <div>
          <p className="admin-req-badge">{badgeText}</p>
          <h1>{title}</h1>
          {subtitle && (
            <p className="admin-req-subtitle">{subtitle}</p>
          )}
        </div>

        <Link to={backTo} className="admin-req-home-link">
          ← Back to Requests Portal
        </Link>
      </div>

      <div className="admin-leave-container">
        {/* ===== TABS ===== */}
        <div className="tab-buttons">
          {Object.entries(TABS).map(([key, label]) => (
            <button
              key={key}
              className={activeTab === key ? "active" : ""}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ===== LOADING / ERROR ===== */}
        {loading && (
          <p className="loading-text">Loading {entityLabel}...</p>
        )}

        {/* ===== REQUEST LIST ===== */}
        <div className="requests-section">
          {!loading && !error && filteredRequests.length === 0 ? (
            <p className="no-requests">
              No {TABS[activeTab].toLowerCase()} in {entityLabel}.
            </p>
          ) : (
            filteredRequests.map((req) => {
              const applnNo = req?.application?.applnNo;
              if (!applnNo) return null;

              return (
                <div key={applnNo} className="request-card">
                  <div className="request-details">
                    {renderDetails(req.application)}
                    <p>
                      <strong>Status:</strong> {req.status}
                    </p>
                  </div>

                  {req.canAct && (
                    <div className="action-buttons">
                      <textarea
                        placeholder="Remarks (optional)"
                        value={remarks[applnNo] || ""}
                        onChange={(e) =>
                          setRemarks({
                            ...remarks,
                            [applnNo]: e.target.value,
                          })
                        }
                      />

                      <button
                        className="accept-btn"
                        onClick={() => handleApprove(applnNo)}
                      >
                        ✅ Accept
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() => handleReject(applnNo)}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequestsPage;
