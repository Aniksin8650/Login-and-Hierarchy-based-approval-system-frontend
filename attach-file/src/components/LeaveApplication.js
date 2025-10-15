import React, { useState, useRef } from "react";
import "./../styles/LeaveApplication.css";
import { useLocation } from "react-router-dom";


function LeaveApplication() {
  const location = useLocation();
  const { applicationType } = location.state || { applicationType: "leave" }; // default "leave"
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

  const fileInputRef = useRef(null);

  // Fetch employee data by ID
  const fetchEmployeeDetails = async () => {
    const id = employeeId.trim();
    if (!id) {
      setEmployeeData({});
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/employees/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployeeData(data);
      } else {
        setEmployeeData({});
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
      setEmployeeData({});
    }
  };

  // File change with type validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Invalid file type! Only PDF, JPG, PNG allowed.");
      e.target.value = "";
      return;
    }
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // const getTomorrowDate = () => {
  //   const tomorrow = new Date();
  //   tomorrow.setDate(tomorrow.getDate() + 1);
  //   return tomorrow.toISOString().split("T")[0];
  // };

  const getInputClass = (field) =>
    submitAttempted && errors[field] ? "input-error" : "";

  // Submit form
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

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      alert("Please fix the highlighted fields.");
      return;
    }

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
    if (file.length > 0) {
      file.forEach((f) => formData.append("files", f));
    }

    try {
      const res = await fetch("http://localhost:8080/api/leave/submit", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setSuccessMessage("Leave application submitted successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);

        setEmployeeId("");
        setEmployeeData({});
        setReason("");
        setContact("");
        setStartDate("");
        setEndDate("");
        setFile([]);
        if (fileInputRef.current) fileInputRef.current.value = "";

        setSubmitAttempted(false);
        setErrors({});
      } else {
        alert("Failed to submit leave application.");
      }
    } catch (error) {
      console.error("Error submitting leave:", error);
      alert("Error submitting leave application.");
    }
  };

  return (
    <div className="leave-container">
      <h2>Leave Application</h2>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Employee ID:</label>
          <input
            type="text"
            value={employeeId}
            onChange={(e) => {
              if (e.target.value.length <= 6) setEmployeeId(e.target.value);
            }}
            onBlur={fetchEmployeeDetails}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchEmployeeDetails();
            }}
            placeholder="Enter Employee ID"
            className={getInputClass("employeeId")}
          />
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
          <label>Department:</label>
          <input type="text" value={employeeData.department || ""} readOnly />
        </div>
        <div className="form-row">
          <label>Designation:</label>
          <input type="text" value={employeeData.designation || ""} readOnly />
        </div>

        <div className="form-row">
          <label>Reason for Leave:</label>
          <input
            type="text"
            placeholder="Enter reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={getInputClass("reason")}
          />
        </div>

        <div className="form-row">
          <label>Leave Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              const newStart = e.target.value;
              setStartDate(newStart);

              if (endDate && new Date(endDate) < new Date(newStart)) {
                setEndDate("");
              }
            }}
            className={getInputClass("startDate")}
          />
        </div>
        <div className="form-row">
          <label>Leave End Date:</label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className={getInputClass("endDate")}
          />
        </div>

        <div className="form-row">
          <label>Contact During Leave:</label>
          <div className="phone-input">
            <span>+91</span>
            <input
              type="text"
              placeholder="Enter 10-digit number"
              value={employeeData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 10) setContact(employeeData.phone || "");
              }}
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="form-row attach-row">
          <label>Attachments:</label>

          <div className="attach-section">
            <button
              type="button"
              className="attach-btn"
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
            >
              {file.length > 0 ? "Add More" : "Attach File"}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              multiple
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files);
                const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
                const allowedNamePattern = /^[a-zA-Z0-9_-]{3,20}$/; 

                const validFiles = [];
                const currentFiles = Array.isArray(file) ? file : []; // ✅ ensure always an array

                selectedFiles.forEach((selectedFile) => {
                  const baseName = selectedFile.name.split(".")[0]; // name without extension

                  // 1️⃣   Check file type
                  if (!allowedTypes.includes(selectedFile.type)) {
                    alert(`${selectedFile.name} is not a valid file type! Only PDF, JPG, PNG allowed.`);
                    return;
                  }

                  // 2️⃣   Check file name validity
                  if (!allowedNamePattern.test(baseName)) {
                    alert(
                      `Invalid file name "${selectedFile.name}". 
                      File names should be 3–20 characters long, contain only letters, numbers, dashes, or underscores.`
                    );
                    return;
                  }

                  // 3️⃣   Check for duplicates in already added files
                  if (file && Array.isArray(file) && file.some((f) => f.name === selectedFile.name)) {
                    alert(`File "${selectedFile.name}" already added.`);
                    return;
                  }

                  validFiles.push(selectedFile);
                });

                if (validFiles.length > 0) {
                  setFile((prev) => [...prev, ...validFiles]);
                }

                e.target.value = ""; // Reset input so same file can be reselected
              }}

            />

            {file.length > 0 && (
              <div className="file-preview-list">
                {file.map((file, index) => {
                  const fileURL = URL.createObjectURL(file);
                  return (
                    <div key={index} className="file-preview">
                      <a
                        href={fileURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Click to preview"
                        className="file-link"
                      >
                        {file.type.startsWith("image/") ? (
                          <img
                            src={fileURL}
                            alt={file.name}
                            className="file-thumb"
                          />
                        ) : (
                          <p className="file-name">{file.name}</p>
                        )}
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setFile((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Submit Application
        </button>
      </form>
    </div>
  );
}

export default LeaveApplication;

