import React, { useState, useEffect, useCallback } from "react";
import "./LeaveApplication.css";
import "../Shared/AttachFile.css";
import { useLocation } from "react-router-dom";
import ApprovalAuditView from "../Shared/ApprovalAuditView";

import AttachFile from "../Shared/AttachFile";
import { formatFileNameForDisplay } from "../Shared/fileNameUtils";

function LeaveApplication() {
const location = useLocation();
const applicationType = location.state?.applicationType ?? "leave";

  const [employeeId, setEmployeeId] = useState("");
  const [employeeData, setEmployeeData] = useState({});
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState([]);

  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [applications, setApplications] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔁 Sorting state (now controlled via table headers)
  const [sortField, setSortField] = useState("ApplnNo");
  const [sortDirection, setSortDirection] = useState("asc");

  // 📄 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 🔔 Toast state
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  // 🔍 Approval audit view
  const [showAudit, setShowAudit] = useState(false);
  const [auditData, setAuditData] = useState(null);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  // 🔔 Toast helper
  function showToast(msg, type = "info") {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  }

  const loadLeaveApplications = useCallback(
    async (empId) => {
      if (!empId) return;
      try {
        const res = await fetch(`${API_BASE}/api/leave/empId/${empId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = Array.isArray(data)
            ? data.map((d) => ({
                ApplnNo: d.applnNo || d.ApplnNo,
                empId: d.empId,
                name: d.name,
                directorate: d.directorate,
                division: d.division,
                reason: d.reason,
                startDate: d.startDate,
                endDate: d.endDate,
                contact: d.contact,
                applicationType: d.applicationType,
                status: d.status || "PENDING", // ✅ ADD THIS
                files: d.fileName
                  ? d.fileName
                      .split(";")
                      .filter(Boolean)
                      .map((name) => ({ name }))
                  : [],
              }))
            : [];
          setApplications(mapped);
        } else {
          setApplications([]);
          showToast("Failed to load leave applications.", "error");
        }
      } catch (err) {
        console.error("Error loading leave applications:", err);
        setApplications([]);
        showToast("Server error while loading leave applications.", "error");
      }
    },
    [API_BASE]
  );

  //Approval History
   const fetchAudit = async (applnNo) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/leave/approvals/approval-history/${applnNo}`
      );
      if (!res.ok) {
        showToast("Failed to load approval history.", "error");
        return;
      }

      const data = await res.json();
      setAuditData({
        applnNo,
        applicationStatus: data.applicationStatus,
        ...data,
      });
      setShowAudit(true);
    } catch (e) {
      console.error(e);
      showToast("Error loading approval audit.", "error");
    }
  };

  // Load logged-in user from localStorage
  const loadUserFromLocal = useCallback(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (!stored) return;

      const u = JSON.parse(stored);

      const empId = u.empId || "";
      const name = u.name || "";
      const directorate = u.directorate || "";
      const division = u.division || "";
      const rawPhone = u.phone ? String(u.phone) : "";
      const cleanedPhone = rawPhone.replace(/\D/g, "").slice(0, 10);

      setEmployeeId(empId);
      setEmployeeData({
        empId,
        name,
        directorate,
        division,
      });
      setContact(cleanedPhone);

      loadLeaveApplications(empId);
    } catch (err) {
      console.error("Failed to load userInfo from localStorage:", err);
      showToast("Error reading user info. Please relogin.", "error");
    }
  }, [loadLeaveApplications]);

  useEffect(() => {
    loadUserFromLocal();
  }, [loadUserFromLocal]);

  const buildFilesFromServer = (fileNameString, appType, empId) => {
    if (!fileNameString) return [];

    return fileNameString
      .split(";")
      .filter(Boolean)
      .map((name) => ({
        name,
        url: `${API_BASE}/uploads/${appType}/${empId}/${name}`,
        isServerFile: true,
      }));
  };

  const handleFinalSubmit = async (applnNo) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/leave/final-submit/${applnNo}`,
        { method: "PUT" }
      );

      if (!res.ok) {
        showToast("Failed to send request.", "error");
        return;
      }

      showToast("Request sent for approval.", "success");
      loadLeaveApplications(employeeId);

    } catch (err) {
      console.error(err);
      showToast("Server error.", "error");
    }
  };


  const getInputClass = (field) =>
    submitAttempted && errors[field] ? "input-error" : "";

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const newErrors = {};
    if (!employeeId.trim() || !employeeData || !employeeData.empId) {
      newErrors.empId = "Employee ID is required";
    }
    if (!reason.trim()) {
      newErrors.reason = "Reason is required";
    }
    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!endDate) {
      newErrors.endDate = "End date is required";
    } else if (startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date cannot be before start date";
    }

    // 🔹 Normalize contact before validation (digits only, max 10)
    const cleanedContact = (contact || "").replace(/\D/g, "").slice(0, 10);

    if (!cleanedContact || cleanedContact.length !== 10) {
      newErrors.contact = "Contact must be 10 digits";
    }

    if (!file || file.length === 0) {
      newErrors.files = "At least one attachment is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast("Please fix highlighted fields before submitting.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("empId", employeeData.empId || employeeId);
    formData.append("applicationType", applicationType);
    formData.append("name", employeeData.name || "");
    formData.append("directorate", employeeData.directorate || "");
    formData.append("division", employeeData.division || "");
    formData.append("reason", reason);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    // 🔹 Always send cleaned contact to backend
    formData.append("contact", cleanedContact);

    // New client files
    file
      .filter((f) => !f.isServerFile)
      .forEach((f) => formData.append("files", f));

    // Retained server files
    const retainedFiles = file
      .filter((f) => f.isServerFile)
      .map((f) => f.name)
      .join(";");

    formData.append("retainedFiles", retainedFiles);

    const ApplnNo =
      editingIndex !== null
        ? applications[editingIndex].ApplnNo
        : `APP-${Date.now()}`;

    formData.append("ApplnNo", ApplnNo);

    try {
      const url =
        editingIndex !== null
          ? `${API_BASE}/api/leave/update/${ApplnNo}`
          : `${API_BASE}/api/leave/submit`;

      const method = editingIndex !== null ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      console.log("Submit response status:", res.status);

      if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        console.log("Backend validation errors:", data);
        const fieldErrors = data.fieldErrors || {};
        setErrors(fieldErrors);
        setSubmitAttempted(true);
        showToast(data.message || "Validation error from server.", "error");
        return;
      }

      if (res.status === 409) {
        const msg = await res.text();
        showToast(msg || "Duplicate leave application.", "error");
        return;
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        console.error("Backend error body:", msg);
        showToast(
          msg || `Failed to submit application. Status: ${res.status}`,
          "error"
        );
        return;
      }

      const empIdToReload = employeeData.empId || employeeId;
      await loadLeaveApplications(empIdToReload);

      if (editingIndex !== null) {
        setEditingIndex(null);
        showToast("Leave application updated successfully!", "success");
      } else {
        showToast("Leave application submitted successfully!", "success");
      }

      // Reset form but keep user from localStorage
      setReason("");
      setStartDate("");
      setEndDate("");
      setFile([]);
      setErrors({});
      setSubmitAttempted(false);
      loadUserFromLocal();
    } catch (err) {
      console.error("Error submitting:", err);
      showToast("Server error while submitting leave.", "error");
    }
  };

  // Edit handler
  const handleEdit = async (index) => {
    const app = applications[index];
    
    if (app.status !== "DRAFT") {
  showToast("Only draft applications can be edited.", "info");
  return;
  }

    setEmployeeId(app.empId);
    setEmployeeData({
      empId: app.empId,
      name: app.name,
      directorate: app.directorate,
      division: app.division,
    });

    setReason(app.reason);
    setStartDate(app.startDate);
    setEndDate(app.endDate);

    // 🔹 Clean contact coming from DB / backend
    const rawContact = app.contact ? String(app.contact) : "";
    const cleanedContact = rawContact.replace(/\D/g, "").slice(0, 10);
    setContact(cleanedContact);

    setEditingIndex(index);
    setErrors({});
    setSubmitAttempted(false);

    try {
      const res = await fetch(`${API_BASE}/api/leave/ApplnNo/${app.ApplnNo}`);
      if (res.ok) {
        const data = await res.json();

        const filesFromServer = buildFilesFromServer(
          data.fileName,
          data.applicationType,
          data.empId
        );

        setFile(filesFromServer);
      } else {
        setFile([]);
        showToast("Failed to load attachments for this application.", "error");
      }
    } catch (err) {
      console.error("Error fetching old files:", err);
      setFile([]);
      showToast("Server error while loading attachments.", "error");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --------- Filter + sort ----------

  const filteredApplications = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (app.ApplnNo || "").toLowerCase().includes(term) ||
      (app.empId || "").toLowerCase().includes(term) ||
      (app.name || "").toLowerCase().includes(term) ||
      (app.reason || "").toLowerCase().includes(term)
    );
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const field = sortField;

    const av = (a[field] || "").toString().toLowerCase();
    const bv = (b[field] || "").toString().toLowerCase();

    if (av < bv) return sortDirection === "asc" ? -1 : 1;
    if (av > bv) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // 🔁 Pagination calculations
  const totalRecords = sortedApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedApplications = sortedApplications.slice(startIndex, endIndex);

  // 🔁 Sort handler on header click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  // --------- Export helpers ----------
  const exportToExcel = (apps) => {
    const headers = [
      "ApplnNo",
      "Emp ID",
      "Name",
      "Start Date",
      "End Date",
      "Reason",
      "Files",
    ];

    const rows = apps.map((app) => [
      app.ApplnNo || "",
      app.empId || "",
      app.name || "",
      app.startDate || "",
      app.endDate || "",
      app.reason || "",
      app.files && app.files.length
      ? app.files.map((f) => formatFileNameForDisplay(f.name)).join("; ")
      : "",
    ]);

    const escapeCsv = (value) => {
      const v = value == null ? "" : String(value);
      if (v.includes('"') || v.includes(",") || v.includes("\n")) {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return v;
    };

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "leave_applications.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = (apps) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Popup blocked. Allow popups to export as PDF.", "error");
      return;
    }

    const headerHtml = `
      <tr>
        <th>ApplnNo</th>
        <th>Emp ID</th>
        <th>Name</th>
        <th>Start Date</th>
        <th>End Date</th>
        <th>Reason</th>
        <th>Files</th>
      </tr>
    `;

    const rowsHtml = apps
      .map(
        (app) => `
      <tr>
        <td>${app.ApplnNo || ""}</td>
        <td>${app.empId || ""}</td>
        <td>${app.name || ""}</td>
        <td>${app.startDate || ""}</td>
        <td>${app.endDate || ""}</td>
        <td>${app.reason || ""}</td>
        <td>${
          app.files && app.files.length
            ? app.files.map((f) => f.name).join("; ")
            : ""
        }</td>
      </tr>
    `
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>Leave Applications</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #333; padding: 4px; font-size: 12px; }
            th { background: #eee; }
          </style>
        </head>
        <body>
          <h3>Leave Applications</h3>
          <table>
            <thead>${headerHtml}</thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExport = (format) => {
    if (!sortedApplications.length) {
      showToast("No data to export.", "info");
      return;
    }
    if (format === "excel") {
      exportToExcel(sortedApplications);
      showToast("Exported to Excel.", "success");
    } else {
      exportToPDF(sortedApplications);
      showToast("Export opened for PDF printing.", "success");
    }
  };

  // Helper to build limited page numbers (for large lists)
  const getPageNumbers = () => {
    const nums = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPageSafe - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) {
      nums.push(i);
    }
    return nums;
  };

  return (
    <>
      {/*Audit History view*/}
      <ApprovalAuditView
        open={showAudit}
        audit={auditData}
        onClose={() => setShowAudit(false)}
      />
      {/* 🔔 Toast */}
      {message && (
        <div className={`toast toast-${messageType}`}>{message}</div>
      )}

      <div className="leave-container">
        <h2>Leave Application</h2>

        <form onSubmit={handleSubmit}>
          {/* Employee ID */}
          <div className="form-row">
            <label>Employee ID:</label>
            <input
              type="text"
              value={employeeId}
              readOnly
              placeholder="Employee ID"
              className={getInputClass("empId")}
            />
            {submitAttempted && errors.empId && (
              <div className="field-error-text">{errors.empId}</div>
            )}
          </div>

          {/* Application Type */}
          <div className="form-row">
            <label>Application Type:</label>
            <input type="text" value={applicationType.toUpperCase()} readOnly />
          </div>

          {/* Name */}
          <div className="form-row">
            <label>Name:</label>
            <input type="text" value={employeeData.name || ""} readOnly />
          </div>

          <div className="form-row">
            <label>Directorate:</label>
            <input type="text" value={employeeData.directorate || ""} readOnly />
          </div>

          <div className="form-row">
            <label>Division:</label>
            <input
              type="text"
              value={employeeData.division || ""}
              readOnly
            />
          </div>

          {/* Reason */}
          <div className="form-row">
            <label>Reason for Leave:</label>
            <div style={{ flex: 2 }}>
              <input
                type="text"
                value={reason}
                onChange={(e) => {
                  const value = e.target.value;
                  setReason(value);
                  setErrors((prev) => {
                    if (!prev.reason) return prev;
                    const u = { ...prev };
                    delete u.reason;
                    return u;
                  });
                }}
                className={getInputClass("reason")}
              />
              {submitAttempted && errors.reason && (
                <div className="field-error-text">{errors.reason}</div>
              )}
            </div>
          </div>

          {/* Start Date */}
          <div className="form-row">
            <label>Start Date:</label>
            <div style={{ flex: 2 }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setStartDate(value);
                  setErrors((prev) => {
                    if (!prev.startDate) return prev;
                    const u = { ...prev };
                    delete u.startDate;
                    return u;
                  });
                }}
                className={getInputClass("startDate")}
              />
              {submitAttempted && errors.startDate && (
                <div className="field-error-text">{errors.startDate}</div>
              )}
            </div>
          </div>

          {/* End Date */}
          <div className="form-row">
            <label>End Date:</label>
            <div style={{ flex: 2 }}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setEndDate(value);
                  setErrors((prev) => {
                    if (!prev.endDate) return prev;
                    const u = { ...prev };
                    delete u.endDate;
                    return u;
                  });
                }}
                className={getInputClass("endDate")}
                min={startDate || ""}
              />
              {submitAttempted && errors.endDate && (
                <div className="field-error-text">{errors.endDate}</div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="form-row">
            <label>Contact:</label>
            <div className="phone-input" style={{ flex: 2 }}>
              <span>+91</span>
              <input
                type="text"
                value={contact}
                onChange={(e) => {
                  const cleaned = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
                  setContact(cleaned);
                  setErrors((prev) => {
                    if (!prev.contact) return prev;
                    const u = { ...prev };
                    delete u.contact;
                    return u;
                  });
                }}
                className={getInputClass("contact")}
              />
            </div>
            {submitAttempted && errors.contact && (
              <div className="field-error-text">{errors.contact}</div>
            )}
          </div>

          {/* Attach File */}
          <div className="form-row attach-row">
            <label>Attachments:</label>
            <div
              className={
                "attach-section" +
                (submitAttempted && errors.files ? " input-error" : "")
              }
            >
              <AttachFile
                files={file}
                onChange={(newFiles) => {
                  setFile(newFiles);
                  setErrors((prev) => {
                    if (!prev.files) return prev;
                    const u = { ...prev };
                    delete u.files;
                    return u;
                  });
                }}
                required={true}
                maxFiles={5}
                label="Attach File"
              />
              {submitAttempted && errors.files && (
                <div className="field-error-text">{errors.files}</div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="button-row">
            <button type="submit" className="submit-btn">
              {editingIndex !== null ? "Update" : "Submit"}
            </button>

            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                setReason("");
                setStartDate("");
                setEndDate("");
                setFile([]);
                setEditingIndex(null);
                setErrors({});
                setSubmitAttempted(false);
                loadUserFromLocal();
                setCurrentPage(1);
                showToast("Form reset.", "info");
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      {applications.length > 0 && (
        <div className="submitted-section-wrapper">
          <div className="submitted-section">
            <h3>Submitted Leave Applications</h3>

            {/* Top controls: entries per page (left) + search (right) */}
            <div className="table-controls">
              <div className="table-control-item">
                <label>Show:&nbsp;</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>&nbsp;entries</span>
              </div>

              <div className="table-control-item">
                <label>Search:&nbsp;</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by ApplnNo, Emp ID, Name, Reason"
                />
              </div>
            </div>

            <table className="applications-table">
              <thead>
                <tr>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("ApplnNo")}
                  >
                    ApplnNo{renderSortIndicator("ApplnNo")}
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("empId")}
                  >
                    Emp ID{renderSortIndicator("empId")}
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("name")}
                  >
                    Name{renderSortIndicator("name")}
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("startDate")}
                  >
                    Start{renderSortIndicator("startDate")}
                  </th>
                  <th
                    className="sortable-header"
                    onClick={() => handleSort("endDate")}
                  >
                    End{renderSortIndicator("endDate")}
                  </th>
                  <th>Reason</th>
                  <th>Files</th>
                  <th>Status</th>
                  <th>Approval History</th>
                </tr>
              </thead>
              <tbody>
                {sortedApplications.length === 0 ? (
                  <tr>
                    <td colSpan="8">No applications found.</td>
                  </tr>
                ) : (
                  paginatedApplications.map((app, idx) => (
                    <tr key={app.ApplnNo}>
                      <td>{app.ApplnNo}</td>
                      <td>{app.empId}</td>
                      <td>{app.name}</td>
                      <td>{app.startDate}</td>
                      <td>{app.endDate}</td>
                      <td>{app.reason}</td>
                      <td>
                        {app.files && app.files.length > 0 ? (
                          app.files.map((f, i) => {
                            const url = `${API_BASE}/uploads/${app.applicationType}/${app.empId}/${f.name}`;
                            return (
                              <div key={i}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {formatFileNameForDisplay(f.name)}
                                </a>
                              </div>
                            );
                          })
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {app.status === "DRAFT" ? (

                          <div className="action-btn-group">
                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEdit(
                                  applications.findIndex((a) => a.ApplnNo === app.ApplnNo)
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="final-submit-btn"
                              onClick={() => handleFinalSubmit(app.ApplnNo)}
                            >
                              Send Request
                            </button>
                          </div>
                        ) : (
                          <span
                            className={
                              app.status === "APPROVED"
                                ? "status-approved"
                                : app.status === "REJECTED"
                                ? "status-rejected"
                                : "status-pending"
                            }
                          >
                            {app.status}
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="audit-btn"
                          onClick={() => fetchAudit(app.ApplnNo)}
                        >
                          View Audit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination row below table */}
            {sortedApplications.length > 0 && (
              <div className="pagination-row">
                <div className="pagination-info">
                  Showing{" "}
                  {totalRecords === 0 ? 0 : startIndex + 1}–{endIndex} of{" "}
                  {totalRecords} entries
                </div>
                <div className="pagination-controls">
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={currentPageSafe === 1}
                    onClick={() => setCurrentPage(1)}
                  >
                    ⏮
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={currentPageSafe === 1}
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                  >
                    ‹ Prev
                  </button>

                  {getPageNumbers().map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={
                        "page-btn" +
                        (num === currentPageSafe ? " active" : "")
                      }
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={currentPageSafe === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Next ›
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={currentPageSafe === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    ⏭
                  </button>
                </div>
              </div>
            )}

            {/* Export */}
            <div className="export-row">
              <span>Export:&nbsp;</span>
              <button
                type="button"
                className="export-btn"
                onClick={() => handleExport("excel")}
              >
                Export to Excel
              </button>
              <button
                type="button"
                className="export-btn"
                onClick={() => handleExport("pdf")}
              >
                Export to PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LeaveApplication;
