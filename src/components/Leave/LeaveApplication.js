import React, { useState, useEffect } from "react";
import "./LeaveApplication.css";
import "../Shared/AttachFile.css";
import { useLocation } from "react-router-dom";

import AttachFile from "../Shared/AttachFile";

function LeaveApplication() {
  const location = useLocation();
  const { applicationType } = location.state || { applicationType: "leave" };

  const [employeeId, setEmployeeId] = useState("");
  const [employeeData, setEmployeeData] = useState({});
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState([]);

  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [applications, setApplications] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // ---------------------------------------------
  // Load logged-in user from localStorage (userInfo from Login)
  // ---------------------------------------------
  const loadUserFromLocal = () => {
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
    } catch (err) {
      console.error("Failed to load userInfo from localStorage:", err);
    }
  };

  useEffect(() => {
    loadUserFromLocal();
  }, []);

  // ---------------------------------------------
  // Helper: build file objects from server data
  // ---------------------------------------------
  const buildFilesFromServer = (fileNameString, appType, empId) => {
    if (!fileNameString) return [];

    return fileNameString
      .split(";")
      .filter(Boolean)
      .map((name) => ({
        name, // stored filename with timestamp
        url: `http://localhost:8080/uploads/${appType}/${empId}/${name}`,
        isServerFile: true,
      }));
  };

  // ---------------------------------------------
  // Helper: make stored filename look nicer in UI
  // ---------------------------------------------
  const getDisplayFileName = (storedName) => {
    if (!storedName) return storedName;

    const parts = storedName.split("_");
    if (parts.length <= 1) return storedName;

    const withoutTimestamp = parts.slice(1).join("_");

    const lastDotIndex = withoutTimestamp.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return withoutTimestamp.replace(/_/g, " ");
    }

    const base = withoutTimestamp.substring(0, lastDotIndex).replace(/_/g, " ");
    const ext = withoutTimestamp.substring(lastDotIndex);
    return base + ext;
  };

  const getInputClass = (field) =>
    submitAttempted && errors[field] ? "input-error" : "";

  // ---------------------------------------------
  // Submit handler
  // ---------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const newErrors = {};

    if (!employeeId.trim()) newErrors.employeeId = true;
    if (!employeeData || !employeeData.empId) newErrors.employeeId = true;
    if (!reason.trim()) newErrors.reason = true;
    if (!startDate) newErrors.startDate = true;
    if (!endDate) newErrors.endDate = true;
    if (startDate && endDate && new Date(endDate) < new Date(startDate))
      newErrors.endDate = true;
    if (!contact || contact.length !== 10) newErrors.contact = true;
    if (!file || file.length === 0) newErrors.file = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alert("Please fix errors before submitting.");
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("empId", employeeData.empId);
    formData.append("applicationType", applicationType);
    formData.append("name", employeeData.name);
    formData.append("department", employeeData.department);
    formData.append("designation", employeeData.designation);
    formData.append("reason", reason);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("contact", contact);

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

    // ApplnNo
    const ApplnNo =
      editingIndex !== null
        ? applications[editingIndex].ApplnNo
        : `APP-${Date.now()}`;

    formData.append("ApplnNo", ApplnNo);

    try {
      const url =
        editingIndex !== null
          ? `http://localhost:8080/api/leave/update/${ApplnNo}`
          : "http://localhost:8080/api/leave/submit";

      const method = editingIndex !== null ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      if (res.status === 409) {
        const msg = await res.text();
        alert(msg);
        return;
      }

      if (res.ok) {
        const detailsRes = await fetch(
          `http://localhost:8080/api/leave/ApplnNo/${ApplnNo}`
        );

        if (!detailsRes.ok) {
          alert("Leave saved, but failed to load details from server.");
          return;
        }

        const data = await detailsRes.json();

        const filesFromServer = buildFilesFromServer(
          data.fileName,
          data.applicationType,
          data.empId
        );

        const newApp = {
          ApplnNo: data.applnNo || data.ApplnNo || ApplnNo,
          empId: data.empId,
          name: data.name,
          department: data.department,
          designation: data.designation,
          reason: data.reason,
          startDate: data.startDate,
          endDate: data.endDate,
          contact: data.contact,
          applicationType: data.applicationType,
          files: filesFromServer,
        };

        if (editingIndex !== null) {
          const updatedList = [...applications];
          updatedList[editingIndex] = newApp;
          setApplications(updatedList);
          setEditingIndex(null);
          setSuccessMessage("Leave application updated!");
        } else {
          setApplications((prev) => [...prev, newApp]);
          setSuccessMessage("Leave application submitted!");
        }

        setTimeout(() => setSuccessMessage(""), 5000);

        // Reset form but keep logged-in user details
        setReason("");
        setContact(employeeData.phone || contact); // keep phone or current
        setStartDate("");
        setEndDate("");
        setFile([]);
        setErrors({});
        setSubmitAttempted(false);
      } else {
        alert("Failed to submit application.");
      }
    } catch (err) {
      console.error("Error submitting:", err);
      alert("Server error.");
    }
  };

  // ---------------------------------------------
  // Edit handler
  // ---------------------------------------------
  const handleEdit = async (index) => {
    const app = applications[index];

    setEmployeeId(app.empId);
    setEmployeeData({
      empId: app.empId,
      name: app.name,
      department: app.department,
      designation: app.designation,
    });

    setReason(app.reason);
    setStartDate(app.startDate);
    setEndDate(app.endDate);
    setContact(app.contact);
    setEditingIndex(index);

    try {
      const res = await fetch(
        `http://localhost:8080/api/leave/ApplnNo/${app.ApplnNo}`
      );
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
      }
    } catch (err) {
      console.error("Error fetching old files:", err);
      setFile([]);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="leave-container">
        <h2>Leave Application</h2>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Employee ID (auto-filled, read-only) */}
          <div className="form-row">
            <label>Employee ID:</label>
            <input
              type="text"
              value={employeeId}
              readOnly
              placeholder="Employee ID"
              className={getInputClass("employeeId")}
            />
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
            <label>Reason for Leave:</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={getInputClass("reason")}
            />
          </div>

          {/* Dates */}
          <div className="form-row">
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={getInputClass("startDate")}
            />
          </div>

          <div className="form-row">
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={getInputClass("endDate")}
            />
          </div>

          {/* Contact */}
          <div className="form-row">
            <label>Contact:</label>
            <div className="phone-input">
              <span>+91</span>
              <input
                type="text"
                value={contact}
                onChange={(e) =>
                  setContact(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className={getInputClass("contact")}
              />
            </div>
          </div>

          {/* Attach File */}
          <div className="form-row attach-row">
            <label>Attachments:</label>
            <div className="attach-section">
              <AttachFile
                files={file}
                onChange={(newFiles) => setFile(newFiles)}
                required={true}
                maxFiles={5}
                label="Attach File"
              />
            </div>
          </div>

          <div className="button-row">
            <button type="submit" className="submit-btn">
              {editingIndex !== null ? "Update" : "Submit"}
            </button>

            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                // Reset only form-specific fields, keep user identity
                setReason("");
                loadUserFromLocal();
                setContact((prev) =>
                  prev ? prev : contact.replace(/\D/g, "").slice(0, 10)
                );
                setStartDate("");
                setEndDate("");
                setFile([]);
                setEditingIndex(null);
                setErrors({});
                setSubmitAttempted(false);
                setSuccessMessage("");
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Print All Leave Applications */}
      <div className="print-btn-container">
        <button
          className="print-btn"
          onClick={() => window.open("/print-leaves", "_blank")}
        >
          🖨️ Print All Leave Applications
        </button>
      </div>

      {/* Table */}
      {applications.length > 0 && (
        <div className="submitted-section-wrapper">
          <div className="submitted-section">
            <h3>Submitted Applications</h3>
            <table className="applications-table">
              <thead>
                <tr>
                  <th>ApplnNo</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Reason</th>
                  <th>Files</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, index) => (
                  <tr key={app.ApplnNo}>
                    <td>{app.ApplnNo}</td>
                    <td>{app.empId}</td>
                    <td>{app.name}</td>
                    <td>{app.applicationType}</td>
                    <td>{app.startDate}</td>
                    <td>{app.endDate}</td>
                    <td>{app.reason}</td>
                    <td>
                      {app.files && app.files.length > 0 ? (
                        app.files.map((f, i) => (
                          <div key={i}>
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {getDisplayFileName(f.name)}
                            </a>
                          </div>
                        ))
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(index)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default LeaveApplication;
