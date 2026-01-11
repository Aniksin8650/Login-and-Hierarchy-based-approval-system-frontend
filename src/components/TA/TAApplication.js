import React, { useState, useEffect, useCallback } from "react";
import "./TAApplication.css";
import "../Shared/AttachFile.css";
import { useLocation } from "react-router-dom";

import AttachFile from "../Shared/AttachFile";
import { formatFileNameForDisplay } from "../Shared/fileNameUtils";

function TAApplication() {
const location = useLocation();
const applicationType = location.state?.applicationType ?? "ta";


  const [employeeId, setEmployeeId] = useState("");
  const [employeeData, setEmployeeData] = useState({});
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState([]);

  // TA specific
  const [travelDate, setTravelDate] = useState("");
  const [distance, setDistance] = useState("");
  const [taAmount, setTaAmount] = useState("");

  // Travel mode: dropdown + optional detail
  const [travelModeType, setTravelModeType] = useState(""); // BUS / TRAIN / FLIGHT / PRIVATE / OTHER
  const [travelModeDetail, setTravelModeDetail] = useState(""); // text for PRIVATE / OTHER

  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [applications, setApplications] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // sorting
  const [sortField, setSortField] = useState("ApplnNo");
  const [sortDirection, setSortDirection] = useState("asc");

  // pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("info");

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  const showToast = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  // ---------- Travel Mode helpers ----------

  const buildTravelModeValue = (type, detail) => {
    const trimmedDetail = (detail || "").trim();

    switch (type) {
      case "BUS":
        return "Bus";
      case "TRAIN":
        return "Train";
      case "FLIGHT":
        return "Flight";
      case "PRIVATE":
        // Private Vehicle (Specify) -> user text + " (Private)"
        return trimmedDetail ? `${trimmedDetail} (Private)` : "";
      case "OTHER":
        // Others (Specify) -> only text
        return trimmedDetail;
      default:
        return "";
    }
  };

  const parseTravelModeFromString = (value = "") => {
    const v = value.trim();
    if (!v) return { type: "", detail: "" };

    if (v === "Bus") return { type: "BUS", detail: "" };
    if (v === "Train") return { type: "TRAIN", detail: "" };
    if (v === "Flight") return { type: "FLIGHT", detail: "" };

    // detect "(Private)" suffix
    if (v.toLowerCase().endsWith("(private)")) {
      const base = v.replace(/\(private\)\s*$/i, "").trim();
      return { type: "PRIVATE", detail: base };
    }

    // everything else -> Others (Specify)
    return { type: "OTHER", detail: v };
  };

  // -------- Load TA applications --------
  const loadTAApplications = useCallback(
    async (empId) => {
      if (!empId) return;
      try {
        const res = await fetch(`${API_BASE}/api/ta/empId/${empId}`);
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
                travelDate: d.travelDate,
                distance: d.distance,
                taAmount: d.taAmount,
                travelMode: d.travelMode,
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
          showToast("Failed to load TA applications.", "error");
        }
      } catch (err) {
        console.error("Error loading TA applications:", err);
        setApplications([]);
        showToast("Server error while loading TA applications.", "error");
      }
    },
    [API_BASE]
  );

  // -------- Load user --------
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

      loadTAApplications(empId);
    } catch (err) {
      console.error("Failed to load userInfo from localStorage:", err);
      showToast("Error reading user info. Please relogin.", "error");
    }
  }, [loadTAApplications]);

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

    // Normalize contact before validation
    const cleanedContact = (contact || "").replace(/\D/g, "").slice(0, 10);

    if (!cleanedContact || cleanedContact.length !== 10) {
      newErrors.contact = "Contact must be 10 digits";
    }

    // TA-specific
    if (!travelDate) {
      newErrors.travelDate = "Travel date is required";
    }
    if (!distance || isNaN(parseFloat(distance))) {
      newErrors.distance = "Enter valid distance";
    }
    if (!taAmount || isNaN(parseFloat(taAmount))) {
      newErrors.taAmount = "Enter valid TA amount";
    }

    const travelModeValue = buildTravelModeValue(
      travelModeType,
      travelModeDetail
    );
    if (!travelModeValue.trim()) {
      newErrors.travelMode = "Travel mode is required";
    }

    if (!file || file.length === 0) {
      newErrors.files = "At least one attachment is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast("Please fix the highlighted fields before submitting.", "error");
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
    // Always send cleaned contact to backend
    formData.append("contact", cleanedContact);

    formData.append("travelDate", travelDate);
    formData.append("distance", distance);
    formData.append("taAmount", taAmount);
    formData.append("travelMode", travelModeValue);

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
        : `TA-${Date.now()}`;
    formData.append("ApplnNo", ApplnNo);

    try {
      const url =
        editingIndex !== null
          ? `${API_BASE}/api/ta/update/${ApplnNo}`
          : `${API_BASE}/api/ta/submit`;
      const method = editingIndex !== null ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      console.log("TA submit status:", res.status);

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
        showToast(msg || "Duplicate TA application.", "error");
        return;
      }

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        console.error("Backend error body:", msg);
        showToast(
          msg || `Failed to submit TA application. Status: ${res.status}`,
          "error"
        );
        return;
      }

      await loadTAApplications(employeeData.empId || employeeId);

      if (editingIndex !== null) {
        setEditingIndex(null);
        showToast("TA application updated successfully!", "success");
      } else {
        showToast("TA application submitted successfully!", "success");
      }

      // reset (keep user)
      setReason("");
      setStartDate("");
      setEndDate("");
      setTravelDate("");
      setDistance("");
      setTaAmount("");
      setTravelModeType("");
      setTravelModeDetail("");
      setFile([]);
      setErrors({});
      setSubmitAttempted(false);
    } catch (err) {
      console.error("Error submitting TA:", err);
      showToast("Server error while submitting TA.", "error");
    }
  };

  // -------- Edit handler --------
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

    // Clean contact coming from DB / backend
    const rawContact = app.contact ? String(app.contact) : "";
    const cleanedContact = rawContact.replace(/\D/g, "").slice(0, 10);
    setContact(cleanedContact);

    setTravelDate(app.travelDate || "");
    setDistance(app.distance || "");
    setTaAmount(app.taAmount || "");

    const parsedMode = parseTravelModeFromString(app.travelMode || "");
    setTravelModeType(parsedMode.type);
    setTravelModeDetail(parsedMode.detail);

    setEditingIndex(index);
    setErrors({});
    setSubmitAttempted(false);

    try {
      const res = await fetch(`${API_BASE}/api/ta/ApplnNo/${app.ApplnNo}`);
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
      console.error("Error fetching TA files:", err);
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
      (app.travelMode || "").toLowerCase().includes(term) ||
      (app.travelDate || "").toLowerCase().includes(term)
    );
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const field = sortField;

    if (field === "distance" || field === "taAmount") {
      const an = parseFloat(a[field]) || 0;
      const bn = parseFloat(b[field]) || 0;
      return sortDirection === "asc" ? an - bn : bn - an;
    }

    const av = (a[field] || "").toString().toLowerCase();
    const bv = (b[field] || "").toString().toLowerCase();

    if (av < bv) return sortDirection === "asc" ? -1 : 1;
    if (av > bv) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // -------- Pagination logic --------
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

  // reset to page 1 when filters/sort/app list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection, rowsPerPage, applications.length]);

  // -------- Sorting via header click (UPDATED LIKE LEAVE) --------
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

  // -------- Export helpers --------
  const exportToExcel = (apps) => {
    const headers = [
      "ApplnNo",
      "Emp ID",
      "Name",
      "Travel Date",
      "Distance",
      "TA Amount",
      "Travel Mode",
      "Files",
    ];

    const rows = apps.map((app) => [
      app.ApplnNo || "",
      app.empId || "",
      app.name || "",
      app.travelDate || "",
      app.distance || "",
      app.taAmount || "",
      app.travelMode || "",
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
    a.download = "ta_applications.csv";
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
        <th>Travel Date</th>
        <th>Distance</th>
        <th>TA Amount</th>
        <th>Travel Mode</th>
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
        <td>${app.travelDate || ""}</td>
        <td>${app.distance || ""}</td>
        <td>${app.taAmount || ""}</td>
        <td>${app.travelMode || ""}</td>
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
          <title>TA Applications</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #333; padding: 4px; font-size: 12px; }
            th { background: #eee; }
          </style>
        </head>
        <body>
          <h3>TA Applications</h3>
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

  // -------- JSX --------
  return (
    <>
      {message && (
        <div className={`toast toast-${messageType}`}>{message}</div>
      )}

      <div className="ta-container">
        <h2>TA Application</h2>

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
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
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

          {/* TA specific fields */}
          <div className="form-row">
            <label>Travel Date:</label>
            <div style={{ flex: 2 }}>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setTravelDate(value);
                  setErrors((prev) => {
                    if (!prev.travelDate) return prev;
                    const u = { ...prev };
                    delete u.travelDate;
                    return u;
                  });
                }}
                className={getInputClass("travelDate")}
              />
              {submitAttempted && errors.travelDate && (
                <div className="field-error-text">{errors.travelDate}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <label>Distance (km):</label>
            <div style={{ flex: 2 }}>
              <input
                type="text"
                value={distance}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, "");
                  setDistance(value);
                  setErrors((prev) => {
                    if (!prev.distance) return prev;
                    const u = { ...prev };
                    delete u.distance;
                    return u;
                  });
                }}
                className={getInputClass("distance")}
              />
              {submitAttempted && errors.distance && (
                <div className="field-error-text">{errors.distance}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <label>TA Amount:</label>
            <div style={{ flex: 2 }}>
              <input
                type="text"
                value={taAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.]/g, "");
                  setTaAmount(value);
                  setErrors((prev) => {
                    if (!prev.taAmount) return prev;
                    const u = { ...prev };
                    delete u.taAmount;
                    return u;
                  });
                }}
                className={getInputClass("taAmount")}
              />
              {submitAttempted && errors.taAmount && (
                <div className="field-error-text">{errors.taAmount}</div>
              )}
            </div>
          </div>

          {/* Travel Mode (dropdown + conditional input) */}
          <div className="form-row">
            <label>Travel Mode:</label>
            <div className="travel-mode-wrapper">
              <select
                value={travelModeType}
                onChange={(e) => {
                  const value = e.target.value;
                  setTravelModeType(value);
                  if (value !== "PRIVATE" && value !== "OTHER") {
                    setTravelModeDetail("");
                  }
                  setErrors((prev) => {
                    if (!prev.travelMode) return prev;
                    const u = { ...prev };
                    delete u.travelMode;
                    return u;
                  });
                }}
                className={`travel-mode-select ${getInputClass("travelMode")}`}
              >
                <option value="">Select mode</option>
                <option value="BUS">Bus</option>
                <option value="TRAIN">Train</option>
                <option value="FLIGHT">Flight</option>
                <option value="PRIVATE">Private Vehicle (Specify)</option>
                <option value="OTHER">Others (Specify)</option>
              </select>

              {(travelModeType === "PRIVATE" ||
                travelModeType === "OTHER") && (
                <input
                  type="text"
                  value={travelModeDetail}
                  onChange={(e) => {
                    setTravelModeDetail(e.target.value);
                    setErrors((prev) => {
                      if (!prev.travelMode) return prev;
                      const u = { ...prev };
                      delete u.travelMode;
                      return u;
                    });
                  }}
                  placeholder={
                    travelModeType === "PRIVATE"
                      ? "Enter vehicle details"
                      : "Enter travel mode"
                  }
                  className={`travel-mode-detail ${getInputClass(
                    "travelMode"
                  )}`}
                />
              )}
            </div>
            {submitAttempted && errors.travelMode && (
              <div className="field-error-text">{errors.travelMode}</div>
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
                setTravelDate("");
                setDistance("");
                setTaAmount("");
                setTravelModeType("");
                setTravelModeDetail("");
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
            <h3>Submitted TA Applications</h3>

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
                  placeholder="Search by ApplnNo, Emp ID, Name, Mode, Date"
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
                  <th onClick={() => handleSort("empId")} className="sortable">
                    Emp ID {renderSortIndicator("empId")}
                  </th>
                  <th onClick={() => handleSort("name")} className="sortable">
                    Name {renderSortIndicator("name")}
                  </th>
                  <th
                    onClick={() => handleSort("travelDate")}
                    className="sortable"
                  >
                    Travel Date {renderSortIndicator("travelDate")}
                  </th>
                  <th
                    onClick={() => handleSort("distance")}
                    className="sortable"
                  >
                    Distance {renderSortIndicator("distance")}
                  </th>
                  <th
                    onClick={() => handleSort("taAmount")}
                    className="sortable"
                  >
                    TA Amount {renderSortIndicator("taAmount")}
                  </th>
                  <th
                    onClick={() => handleSort("travelMode")}
                    className="sortable"
                  >
                    Travel Mode {renderSortIndicator("travelMode")}
                  </th>
                  <th>Files</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.map((app, idx) => (
                  <tr key={app.ApplnNo || idx}>
                    <td>{app.ApplnNo}</td>
                    <td>{app.empId}</td>
                    <td>{app.name}</td>
                    <td>{app.travelDate}</td>
                    <td>{app.distance}</td>
                    <td>{app.taAmount}</td>
                    <td>{app.travelMode}</td>
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
                      {app.status === "PENDING" ? (
                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(
                              applications.findIndex(
                                (x) => x.ApplnNo === app.ApplnNo
                              )
                            )
                          }
                        >
                          Edit
                        </button>
                      ) : (
                        <span className={`status-text status-${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {paginatedApplications.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center" }}>
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
                {sortedApplications.length === 0
                  ? 0
                  : startIndex + 1}{" "}
                to{" "}
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

export default TAApplication;
