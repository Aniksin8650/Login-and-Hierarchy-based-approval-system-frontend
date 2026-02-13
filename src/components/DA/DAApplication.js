import React, { useState, useEffect, useCallback } from "react";
import "./DAApplication.css";
import "../Shared/AttachFile.css";
import { useLocation } from "react-router-dom";
import ApprovalAuditView from "../Shared/ApprovalAuditView";

import AttachFile from "../Shared/AttachFile";
import { formatFileNameForDisplay } from "../Shared/fileNameUtils";

function DAApplication() {
const location = useLocation();
const applicationType = location.state?.applicationType ?? "da";

  const [employeeId, setEmployeeId] = useState("");
  const [employeeData, setEmployeeData] = useState({});
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState([]);

  // DA specific
  const [billDate, setBillDate] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [purpose, setPurpose] = useState("");

  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [applications, setApplications] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // table controls
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("ApplnNo");
  const [sortDirection, setSortDirection] = useState("asc");

  // pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Toast
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");
  
  // 🔍 Approval audit view
  const [showAudit, setShowAudit] = useState(false);
  const [auditData, setAuditData] = useState(null);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  const showToast = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  // --------------------------------------------------------------------
  // Load all DA applications for an employee
  // --------------------------------------------------------------------
  const loadDaApplications = useCallback(
    async (empId) => {
      if (!empId) return;
      try {
        const res = await fetch(`${API_BASE}/api/da/empId/${empId}`);
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
                billDate: d.billDate,
                billAmount: d.billAmount,
                purpose: d.purpose,
                status: (d.status || "PENDING").toUpperCase(),
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
          showToast("Failed to load DA applications.", "error");
        }
      } catch (err) {
        console.error("Error loading DA applications:", err);
        setApplications([]);
        showToast("Server error while loading DA applications.", "error");
      }
    },
    [API_BASE]
  );

  //Approval History
   const fetchAudit = async (applnNo) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/da/approvals/approval-history/${applnNo}`
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

  // --------------------------------------------------------------------
  // Load logged-in user from localStorage
  // --------------------------------------------------------------------
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

      loadDaApplications(empId);
    } catch (err) {
      console.error("Failed to load userInfo from localStorage:", err);
      showToast("Error reading user info. Please relogin.", "error");
    }
  }, [loadDaApplications]);

  useEffect(() => {
    loadUserFromLocal();
  }, [loadUserFromLocal]);

  const getInputClass = (field) =>
    submitAttempted && errors[field] ? "input-error" : "";

  // --------------------------------------------------------------------
  // Submit handler
  // --------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const newErrors = {};

    // basic validation
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

    // DA-specific
    if (!billDate) {
      newErrors.billDate = "Bill date is required";
    }
    if (!billAmount || isNaN(parseFloat(billAmount))) {
      newErrors.billAmount = "Bill amount must be a valid number";
    }
    if (!purpose.trim()) {
      newErrors.purpose = "Purpose is required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast("Please fix errors before submitting.", "error");
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

    formData.append("billDate", billDate);
    formData.append("billAmount", billAmount);
    formData.append("purpose", purpose);

    file
      .filter((f) => !f.isServerFile)
      .forEach((f) => formData.append("files", f));

    const retainedFiles = file
      .filter((f) => f.isServerFile)
      .map((f) => f.name)
      .join(";");
    formData.append("retainedFiles", retainedFiles);

    const ApplnNo =
      editingIndex !== null
        ? applications[editingIndex].ApplnNo
        : `DA-${Date.now()}`;
    formData.append("ApplnNo", ApplnNo);

    try {
      const url =
        editingIndex !== null
          ? `${API_BASE}/api/da/update/${ApplnNo}`
          : `${API_BASE}/api/da/submit`;
      const method = editingIndex !== null ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });

      if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        const fieldErrors = data.fieldErrors || {};
        setErrors(fieldErrors);
        setSubmitAttempted(true);
        showToast(data.message || "Validation error from server.", "error");
        return;
      }

      if (res.status === 409) {
        const msg = await res.text();
        showToast(msg || "Duplicate DA application.", "error");
        return;
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        console.error("Backend error body:", msg);
        showToast(
          msg || `Failed to submit DA application. Status: ${res.status}`,
          "error"
        );
        return;
      }

      const empIdToReload = employeeData.empId || employeeId;
      await loadDaApplications(empIdToReload);

      if (editingIndex !== null) {
        setEditingIndex(null);
        showToast("DA application updated successfully!", "success");
      } else {
        showToast("DA application submitted successfully!", "success");
      }

      // Reset form (but keep user info from localStorage)
      setReason("");
      setContact("");
      setStartDate("");
      setEndDate("");
      setFile([]);
      setBillDate("");
      setBillAmount("");
      setPurpose("");
      setErrors({});
      setSubmitAttempted(false);
    } catch (err) {
      console.error("Error submitting DA:", err);
      showToast("Server error while submitting DA.", "error");
    }
  };

  const handleFinalSubmit = async (applnNo) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/da/final-submit/${applnNo}`,
        { method: "PUT" }
      );

      if (!res.ok) {
        showToast("Failed to send request.", "error");
        return;
      }

      showToast("Request sent for approval.", "success");
      loadDaApplications(employeeId);

    } catch (err) {
      console.error(err);
      showToast("Server error.", "error");
    }
  };


  // --------------------------------------------------------------------
  // Edit handler
  // --------------------------------------------------------------------
  const handleEdit = async (index) => {
    const app = applications[index];

          // 🚫 HARD BUSINESS GUARD
  if (!app || app.status !== "PENDING") {
    showToast(
      `This application is already ${app?.status || "processed"} and cannot be edited.`,
      "error"
    );
    return;
  }
    setEmployeeId(app.empId);
    setEmployeeData({
      empId: app.empId,
      name: app.name,
      directorate: app.directorate,
      division: app.division,
    });
    setReason(app.reason || "");
    setStartDate(app.startDate || "");
    setEndDate(app.endDate || "");

    // 🔹 Clean contact coming from DB / backend
    const rawContact = app.contact ? String(app.contact) : "";
    const cleanedContact = rawContact.replace(/\D/g, "").slice(0, 10);
    setContact(cleanedContact);

    setBillDate(app.billDate || "");
    setBillAmount(app.billAmount || "");
    setPurpose(app.purpose || "");
    setEditingIndex(index);
    setErrors({});
    setSubmitAttempted(false);

    try {
      const res = await fetch(`${API_BASE}/api/da/ApplnNo/${app.ApplnNo}`);
      if (res.ok) {
        const data = await res.json();
        if (data.fileName) {
          const filesFromServer = data.fileName
            .split(";")
            .filter(Boolean)
            .map((name) => ({
              name,
              url: `${API_BASE}/uploads/${data.applicationType}/${data.empId}/${name}`,
              isServerFile: true,
            }));
          setFile(filesFromServer);
        } else setFile([]);
      } else {
        setFile([]);
        showToast("Failed to load attachments for this application.", "error");
      }
    } catch (err) {
      console.error("Error fetching DA files:", err);
      setFile([]);
      showToast("Server error while loading attachments.", "error");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------- table filter + sort -------
  const filteredApplications = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (app.ApplnNo || "").toLowerCase().includes(term) ||
      (app.empId || "").toLowerCase().includes(term) ||
      (app.name || "").toLowerCase().includes(term) ||
      (app.purpose || "").toLowerCase().includes(term)
    );
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const field = sortField;
    if (field === "billAmount") {
      const an = parseFloat(a.billAmount) || 0;
      const bn = parseFloat(b.billAmount) || 0;
      return sortDirection === "asc" ? an - bn : bn - an;
    }

    const av = (a[field] || "").toString().toLowerCase();
    const bv = (b[field] || "").toString().toLowerCase();

    if (av < bv) return sortDirection === "asc" ? -1 : 1;
    if (av > bv) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // ------- pagination -------
  const totalPages = Math.max(
    1,
    Math.ceil(sortedApplications.length / rowsPerPage || 1)
  );
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedApplications = sortedApplications.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    const value = parseInt(e.target.value, 10) || 10;
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  // reset to page 1 when relevant dependencies change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection, rowsPerPage, applications.length]);

  // ------- header-based sorting -------
  // ------- header-based sorting (toggle asc/desc like Leave) -------
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
    if (sortField !== field) return null;
    return (
      <span className="sort-indicator">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  // ------- export helpers -------
  const exportToExcel = (apps) => {
    const headers = [
      "ApplnNo",
      "Emp ID",
      "Name",
      "Bill Date",
      "Bill Amount",
      "Purpose",
    ];

    const rows = apps.map((app) => [
      app.ApplnNo || "",
      app.empId || "",
      app.name || "",
      app.billDate || "",
      app.billAmount || "",
      app.purpose || "",
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
    a.download = "da_applications.csv";
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
        <th>Bill Date</th>
        <th>Bill Amount</th>
        <th>Purpose</th>
      </tr>
    `;

    const rowsHtml = apps
      .map(
        (app) => `
      <tr>
        <td>${app.ApplnNo || ""}</td>
        <td>${app.empId || ""}</td>
        <td>${app.name || ""}</td>
        <td>${app.billDate || ""}</td>
        <td>${app.billAmount || ""}</td>
        <td>${app.purpose || ""}</td>
      </tr>
    `
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>DA Applications</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #333; padding: 4px; font-size: 12px; }
            th { background: #eee; }
          </style>
        </head>
        <body>
          <h3>DA Applications</h3>
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

  return (
    <>
      {/*Audit History view*/}
      <ApprovalAuditView
        open={showAudit}
        audit={auditData}
        onClose={() => setShowAudit(false)}
      />
      {message && (
        <div className={`toast toast-${messageType}`}>{message}</div>
      )}

      <div className="da-container">
        <h2>DA Application</h2>

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

          <div className="form-row">
            <label>Application Type:</label>
            <input type="text" value={applicationType.toUpperCase()} readOnly />
          </div>

          <div className="form-row">
            <label>Name:</label>
            <input type="text" value={employeeData.name || ""} readOnly />
          </div>

          <div className="form-row">
            <label>Directorate:</label>
            <input
              type="text"
              value={employeeData.directorate || ""}
              readOnly
            />
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
            <label>Reason:</label>
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

          {/* DA specific fields */}
          <div className="form-row">
            <label>Bill Date:</label>
            <div style={{ flex: 2 }}>
              <input
                type="date"
                value={billDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setBillDate(value);
                  setErrors((prev) => {
                    if (!prev.billDate) return prev;
                    const u = { ...prev };
                    delete u.billDate;
                    return u;
                  });
                }}
                className={getInputClass("billDate")}
              />
              {submitAttempted && errors.billDate && (
                <div className="field-error-text">{errors.billDate}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <label>Bill Amount:</label>
            <div style={{ flex: 2 }}>
              <input
                type="text"
                value={billAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, "");
                  setBillAmount(value);
                  setErrors((prev) => {
                    if (!prev.billAmount) return prev;
                    const u = { ...prev };
                    delete u.billAmount;
                    return u;
                  });
                }}
                className={getInputClass("billAmount")}
              />
              {submitAttempted && errors.billAmount && (
                <div className="field-error-text">{errors.billAmount}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <label>Purpose:</label>
            <div style={{ flex: 2 }}>
              <input
                type="text"
                value={purpose}
                onChange={(e) => {
                  const value = e.target.value;
                  setPurpose(value);
                  setErrors((prev) => {
                    if (!prev.purpose) return prev;
                    const u = { ...prev };
                    delete u.purpose;
                    return u;
                  });
                }}
                className={getInputClass("purpose")}
              />
              {submitAttempted && errors.purpose && (
                <div className="field-error-text">{errors.purpose}</div>
              )}
            </div>
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
                setContact("");
                setStartDate("");
                setEndDate("");
                setBillDate("");
                setBillAmount("");
                setPurpose("");
                setFile([]);
                setEditingIndex(null);
                setErrors({});
                setSubmitAttempted(false);
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
            <h3>Submitted DA Applications</h3>

            {/* Top controls: entries-per-page & search */}
            <div className="table-controls">
              <div className="table-control-item">
                <label>
                  Show{" "}
                  <select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>{" "}
                  entries
                </label>
              </div>
              <div className="table-control-item">
                <label>Search:&nbsp;</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ApplnNo, Emp ID, Name, Purpose"
                />
              </div>
            </div>

            <table className="applications-table">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("ApplnNo")}
                    className="sortable"
                  >
                    ApplnNo {renderSortIndicator("ApplnNo")}
                  </th>
                  <th
                    onClick={() => handleSort("empId")}
                    className="sortable"
                  >
                    Emp ID {renderSortIndicator("empId")}
                  </th>
                  <th
                    onClick={() => handleSort("name")}
                    className="sortable"
                  >
                    Name {renderSortIndicator("name")}
                  </th>
                  <th
                    onClick={() => handleSort("billDate")}
                    className="sortable"
                  >
                    Bill Date {renderSortIndicator("billDate")}
                  </th>
                  <th
                    onClick={() => handleSort("billAmount")}
                    className="sortable"
                  >
                    Bill Amount {renderSortIndicator("billAmount")}
                  </th>
                  <th
                    onClick={() => handleSort("purpose")}
                    className="sortable"
                  >
                    Purpose {renderSortIndicator("purpose")}
                  </th>
                  <th>Files</th>
                  <th>Status</th>
                  <th>Approval History</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.map((app, idx) => (
                  <tr key={app.ApplnNo || idx}>
                    <td>{app.ApplnNo}</td>
                    <td>{app.empId}</td>
                    <td>{app.name}</td>
                    <td>{app.billDate}</td>
                    <td>{app.billAmount}</td>
                    <td>{app.purpose}</td>
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
                            onClick={() => handleEdit(index)}
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
                ))}

                {paginatedApplications.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center" }}>
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination bottom row */}
            <div className="pagination-container">
              <div className="pagination-info">
                Showing{" "}
                {sortedApplications.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(endIndex, sortedApplications.length)} of{" "}
                {sortedApplications.length} entries
              </div>

              <div className="pagination">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPageSafe - 1)}
                  disabled={currentPageSafe === 1}
                >
                  &laquo;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={
                        page === currentPageSafe ? "active" : undefined
                      }
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPageSafe + 1)}
                  disabled={currentPageSafe === totalPages}
                >
                  &raquo;
                </button>
              </div>
            </div>

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

export default DAApplication;
