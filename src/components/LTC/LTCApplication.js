import React, { useState, useEffect, useCallback } from "react";
import "./LTCApplication.css";
import "../Shared/AttachFile.css";
import { useLocation } from "react-router-dom";

import AttachFile from "../Shared/AttachFile";

function LTCApplication() {
  const location = useLocation();
  const { applicationType } = location.state || { applicationType: "ltc" };

  const [employeeId, setEmployeeId] = useState("");
  const [employeeData, setEmployeeData] = useState({});
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState([]);

  // LTC specific
  const [destination, setDestination] = useState("");
  const [familyCount, setFamilyCount] = useState("");
  const [claimYear, setClaimYear] = useState("");

  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [applications, setApplications] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("ApplnNo");
  const [sortDirection, setSortDirection] = useState("asc");

  // Toast
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  const showToast = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  // -------- Load LTC applications for employee --------
  const loadLTCApplications = useCallback(
    async (empId) => {
      if (!empId) return;
      try {
        const res = await fetch(`${API_BASE}/api/ltc/empId/${empId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = Array.isArray(data)
            ? data.map((d) => ({
                ApplnNo: d.applnNo || d.ApplnNo,
                empId: d.empId,
                name: d.name,
                department: d.department,
                designation: d.designation,
                reason: d.reason,
                startDate: d.startDate,
                endDate: d.endDate,
                contact: d.contact,
                applicationType: d.applicationType,
                destination: d.destination,
                familyCount: d.familyCount,
                claimYear: d.claimYear,
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
          showToast("Failed to load LTC applications.", "error");
        }
      } catch (err) {
        console.error("Error loading LTC applications:", err);
        setApplications([]);
        showToast("Server error while loading LTC applications.", "error");
      }
    },
    [API_BASE]
  );

  // -------- Load user from localStorage --------
  const loadUserFromLocal = useCallback(() => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (!stored) return;

      const u = JSON.parse(stored);

      const empId = u.empId || "";
      const name = u.name || "";
      const department = u.department || "";
      const designation = u.designation || "";
      const rawPhone = u.phone ? String(u.phone) : "";
      const cleanedPhone = rawPhone.replace(/\D/g, "").slice(0, 10);

      setEmployeeId(empId);
      setEmployeeData({
        empId,
        name,
        department,
        designation,
      });
      setContact(cleanedPhone);

      loadLTCApplications(empId);
    } catch (err) {
      console.error("Failed to load userInfo from localStorage:", err);
      showToast("Error reading user info. Please relogin.", "error");
    }
  }, [loadLTCApplications]);

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

  const getInputClass = (field) =>
    submitAttempted && errors[field] ? "input-error" : "";

  // -------- Submit handler --------
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
    if (!contact || contact.length !== 10) {
      newErrors.contact = "Contact must be 10 digits";
    }
    if (!destination.trim()) {
      newErrors.destination = "Destination is required";
    }
    if (!familyCount || isNaN(parseInt(familyCount))) {
      newErrors.familyCount = "Enter valid family members count";
    }
    if (!claimYear || !/^\d{4}$/.test(claimYear)) {
      newErrors.claimYear = "Enter a valid year (YYYY)";
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
    formData.append("department", employeeData.department || "");
    formData.append("designation", employeeData.designation || "");
    formData.append("reason", reason);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("contact", contact);

    formData.append("destination", destination);
    formData.append("familyCount", familyCount);
    formData.append("claimYear", claimYear);

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
        : `LTC-${Date.now()}`;
    formData.append("ApplnNo", ApplnNo);

    try {
      const url =
        editingIndex !== null
          ? `${API_BASE}/api/ltc/update/${ApplnNo}`
          : `${API_BASE}/api/ltc/submit`;
      const method = editingIndex !== null ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      console.log("LTC submit status:", res.status);

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
        showToast(msg || "Duplicate LTC application.", "error");
        return;
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        console.error("Backend error body:", msg);
        showToast(
          msg || `Failed to submit LTC application. Status: ${res.status}`,
          "error"
        );
        return;
      }

      await loadLTCApplications(employeeData.empId || employeeId);

      if (editingIndex !== null) {
        setEditingIndex(null);
        showToast("LTC application updated successfully!", "success");
      } else {
        showToast("LTC application submitted successfully!", "success");
      }

      // Reset form but keep logged in user
      setReason("");
      setStartDate("");
      setEndDate("");
      setDestination("");
      setFamilyCount("");
      setClaimYear("");
      setFile([]);
      setErrors({});
      setSubmitAttempted(false);
    } catch (err) {
      console.error("Error submitting LTC:", err);
      showToast("Server error while submitting LTC.", "error");
    }
  };

  // -------- Edit handler --------
  const handleEdit = async (index) => {
    const app = applications[index];

    setEmployeeId(app.empId);
    setEmployeeData({
      empId: app.empId,
      name: app.name,
      department: app.department,
      designation: app.designation,
    });

    setReason(app.reason || "");
    setStartDate(app.startDate || "");
    setEndDate(app.endDate || "");
    setContact(app.contact || "");
    setDestination(app.destination || "");
    setFamilyCount(app.familyCount || "");
    setClaimYear(app.claimYear || "");
    setEditingIndex(index);
    setErrors({});
    setSubmitAttempted(false);

    try {
      const res = await fetch(`${API_BASE}/api/ltc/ApplnNo/${app.ApplnNo}`);
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
      console.error("Error fetching LTC files:", err);
      setFile([]);
      showToast("Server error while loading attachments.", "error");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // -------- Filter + Sort --------
  const filteredApplications = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (app.ApplnNo || "").toLowerCase().includes(term) ||
      (app.empId || "").toLowerCase().includes(term) ||
      (app.name || "").toLowerCase().includes(term) ||
      (app.destination || "").toLowerCase().includes(term) ||
      (app.claimYear || "").toLowerCase().includes(term)
    );
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const field = sortField;

    if (field === "familyCount") {
      const an = parseInt(a.familyCount) || 0;
      const bn = parseInt(b.familyCount) || 0;
      return sortDirection === "asc" ? an - bn : bn - an;
    }

    const av = (a[field] || "").toString().toLowerCase();
    const bv = (b[field] || "").toString().toLowerCase();

    if (av < bv) return sortDirection === "asc" ? -1 : 1;
    if (av > bv) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // -------- Export helpers --------
  const exportToExcel = (apps) => {
    const headers = [
      "ApplnNo",
      "Emp ID",
      "Name",
      "Destination",
      "Family Count",
      "Claim Year",
      "Files",
    ];

    const rows = apps.map((app) => [
      app.ApplnNo || "",
      app.empId || "",
      app.name || "",
      app.destination || "",
      app.familyCount || "",
      app.claimYear || "",
      app.files && app.files.length
        ? app.files.map((f) => f.name).join("; ")
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
    a.download = "ltc_applications.csv";
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
        <th>Destination</th>
        <th>Family Count</th>
        <th>Claim Year</th>
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
        <td>${app.destination || ""}</td>
        <td>${app.familyCount || ""}</td>
        <td>${app.claimYear || ""}</td>
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
          <title>LTC Applications</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #333; padding: 4px; font-size: 12px; }
            th { background: #eee; }
          </style>
        </head>
        <body>
          <h3>LTC Applications</h3>
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
      {message && (
        <div className={`toast toast-${messageType}`}>{message}</div>
      )}

      <div className="ltc-container">
        <h2>LTC Application</h2>

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
            <label>Department:</label>
            <input type="text" value={employeeData.department || ""} readOnly />
          </div>

          <div className="form-row">
            <label>Designation:</label>
            <input
              type="text"
              value={employeeData.designation || ""}
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

          {/* Destination */}
          <div className="form-row">
            <label>Destination:</label>
            <div style={{ flex: 2 }}>
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  const value = e.target.value;
                  setDestination(value);
                  setErrors((prev) => {
                    if (!prev.destination) return prev;
                    const u = { ...prev };
                    delete u.destination;
                    return u;
                  });
                }}
                className={getInputClass("destination")}
              />
              {submitAttempted && errors.destination && (
                <div className="field-error-text">{errors.destination}</div>
              )}
            </div>
          </div>

          {/* Family Members */}
          <div className="form-row">
            <label>Family Members:</label>
            <div style={{ flex: 2 }}>
              <input
                type="text"
                value={familyCount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  setFamilyCount(value);
                  setErrors((prev) => {
                    if (!prev.familyCount) return prev;
                    const u = { ...prev };
                    delete u.familyCount;
                    return u;
                  });
                }}
                className={getInputClass("familyCount")}
              />
              {submitAttempted && errors.familyCount && (
                <div className="field-error-text">{errors.familyCount}</div>
              )}
            </div>
          </div>

          {/* Claim Year */}
          <div className="form-row">
            <label>Claim Year:</label>
            <div style={{ flex: 2 }}>
              <input
                type="text"
                value={claimYear}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  setClaimYear(value);
                  setErrors((prev) => {
                    if (!prev.claimYear) return prev;
                    const u = { ...prev };
                    delete u.claimYear;
                    return u;
                  });
                }}
                className={getInputClass("claimYear")}
              />
              {submitAttempted && errors.claimYear && (
                <div className="field-error-text">{errors.claimYear}</div>
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
                setStartDate("");
                setEndDate("");
                setDestination("");
                setFamilyCount("");
                setClaimYear("");
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
            <h3>Submitted LTC Applications</h3>

            <div className="table-controls">
              <div className="table-control-item">
                <label>Search:&nbsp;</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ApplnNo, Emp ID, Name, Destination"
                />
              </div>

              <div className="table-control-item">
                <label>Sort by:&nbsp;</label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="ApplnNo">Application No</option>
                  <option value="name">Name</option>
                  <option value="destination">Destination</option>
                  <option value="familyCount">Family Count</option>
                  <option value="claimYear">Claim Year</option>
                </select>
                <button
                  type="button"
                  className="sort-direction-btn"
                  onClick={() =>
                    setSortDirection((prev) =>
                      prev === "asc" ? "desc" : "asc"
                    )
                  }
                >
                  {sortDirection === "asc" ? "⬆️ Asc" : "⬇️ Desc"}
                </button>
              </div>
            </div>

            <table className="applications-table">
              <thead>
                <tr>
                  <th>ApplnNo</th>
                  <th>Emp ID</th>
                  <th>Name</th>
                  <th>Destination</th>
                  <th>Family</th>
                  <th>Claim Year</th>
                  <th>Files</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedApplications.map((app, idx) => (
                  <tr key={app.ApplnNo}>
                    <td>{app.ApplnNo}</td>
                    <td>{app.empId}</td>
                    <td>{app.name}</td>
                    <td>{app.destination}</td>
                    <td>{app.familyCount}</td>
                    <td>{app.claimYear}</td>
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
                                {f.name}
                              </a>
                            </div>
                          );
                        })
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(idx)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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

export default LTCApplication;
