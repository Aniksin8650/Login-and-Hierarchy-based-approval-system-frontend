import React, { useState, useEffect } from "react";
import "./TAApplication.css";
import "../Shared/AttachFile.css";
import { useLocation } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

import AttachFile from "../Shared/AttachFile";

function TAApplication() {
  const location = useLocation();
  const { applicationType } = location.state || { applicationType: "ta" };
  // const navigate = useNavigate();

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
  const [travelMode, setTravelMode] = useState("");

  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [applications, setApplications] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);


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

  // const fetchEmployeeDetails = async () => {
  //   const id = employeeId.trim();
  //   if (!id) {
  //     setEmployeeData({});
  //     return;
  //   }
  //   try {
  //     const res = await fetch(`http://localhost:8080/api/employees/id/${id}`);
  //     if (res.ok) {
  //       const data = await res.json();
  //       setEmployeeData(data);
  //     } else {
  //       setEmployeeData({});
  //     }
  //   } catch (err) {
  //     console.error("Error fetching employee:", err);
  //     setEmployeeData({});
  //   }
  // };

  const getInputClass = (field) =>
    submitAttempted && errors[field] ? "input-error" : "";

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

    // TA-specific validations
    if (!travelDate) newErrors.travelDate = true;
    if (!distance || isNaN(parseFloat(distance))) newErrors.distance = true;
    if (!taAmount || isNaN(parseFloat(taAmount))) newErrors.taAmount = true;
    if (!travelMode.trim()) newErrors.travelMode = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alert("Please fix the highlighted fields before submitting.");
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

    // TA-specific
    formData.append("travelDate", travelDate);
    formData.append("distance", distance);
    formData.append("taAmount", taAmount);
    formData.append("travelMode", travelMode);

    // append new files
    file.filter((f) => !f.isServerFile).forEach((f) => formData.append("files", f));
    const retainedFiles = file.filter((f) => f.isServerFile).map((f) => f.name).join(";");
    formData.append("retainedFiles", retainedFiles);

    const ApplnNo = editingIndex !== null ? applications[editingIndex].ApplnNo : `TA-${Date.now()}`;
    formData.append("ApplnNo", ApplnNo);

    try {
      const url = editingIndex !== null
        ? `http://localhost:8080/api/ta/update/${ApplnNo}`
        : "http://localhost:8080/api/ta/submit";
      const method = editingIndex !== null ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      if (res.status === 409) {
        const msg = await res.text();
        alert(msg);
        return;
      }

      if (res.ok) {
        const newApp = {
          ApplnNo,
          empId: employeeData.empId,
          name: employeeData.name,
          department: employeeData.department,
          designation: employeeData.designation,
          reason,
          startDate,
          endDate,
          contact,
          applicationType,
          travelDate,
          distance,
          taAmount,
          travelMode,
          files: file.map((f) => ({ name: f.name, type: f.type || "server-file" })),
        };

        if (editingIndex !== null) {
          const updated = [...applications];
          updated[editingIndex] = newApp;
          setApplications(updated);
          setEditingIndex(null);
          setSuccessMessage("TA application updated!");
        } else {
          setApplications((prev) => [...prev, newApp]);
          setSuccessMessage("TA application submitted!");
        }

        setTimeout(() => setSuccessMessage(""), 5000);

        // reset
        setEmployeeId("");
        setEmployeeData({});
        setReason("");
        setContact("");
        setStartDate("");
        setEndDate("");
        setFile([]);
        setTravelDate("");
        setDistance("");
        setTaAmount("");
        setTravelMode("");
        setErrors({});
        setSubmitAttempted(false);
      } else {
        alert("Failed to submit TA application.");
      }
    } catch (err) {
      console.error("Error submitting TA:", err);
      alert("Server error.");
    }
  };

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
    setTravelDate(app.travelDate || "");
    setDistance(app.distance || "");
    setTaAmount(app.taAmount || "");
    setTravelMode(app.travelMode || "");
    setEditingIndex(index);

    try {
      const res = await fetch(`http://localhost:8080/api/ta/ApplnNo/${app.ApplnNo}`);
      if (res.ok) {
        const data = await res.json();
        if (data.fileName) {
          const filesFromServer = data.fileName.split(";").filter(Boolean).map((name) => ({
            name,
            url: `http://localhost:8080/uploads/${data.applicationType}/${data.empId}/${name}`,
            isServerFile: true,
          }));
          setFile(filesFromServer);
        } else {
          setFile([]);
        }
      }
    } catch (err) {
      console.error("Error fetching TA files:", err);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="ta-container">
        <h2>TA Application</h2>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className="form-row">
            <label>Application Type:</label>
            <input type="text" value={applicationType.toUpperCase()} readOnly />
          </div>

          <div className="form-row"><label>Name:</label><input type="text" value={employeeData.name || ""} readOnly /></div>
          <div className="form-row"><label>Department:</label><input type="text" value={employeeData.department || ""} readOnly /></div>
          <div className="form-row"><label>Designation:</label><input type="text" value={employeeData.designation || ""} readOnly /></div>

          <div className="form-row"><label>Reason:</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className={getInputClass("reason")} />
          </div>

          <div className="form-row"><label>Start Date:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={getInputClass("startDate")} />
          </div>

          <div className="form-row"><label>End Date:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={getInputClass("endDate")} />
          </div>

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

          {/* TA specific fields */}
          <div className="form-row"><label>Travel Date:</label>
            <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className={getInputClass("travelDate")} />
          </div>

          <div className="form-row"><label>Distance (km):</label>
            <input type="text" value={distance} onChange={(e) => setDistance(e.target.value.replace(/[^\d.]/g, ""))} className={getInputClass("distance")} />
          </div>

          <div className="form-row"><label>TA Amount:</label>
            <input type="text" value={taAmount} onChange={(e) => setTaAmount(e.target.value.replace(/[^\d.]/g, ""))} className={getInputClass("taAmount")} />
          </div>

          <div className="form-row"><label>Travel Mode:</label>
            <input type="text" value={travelMode} onChange={(e) => setTravelMode(e.target.value)} className={getInputClass("travelMode")} />
          </div>

          <div className="form-row attach-row">
            <label>Attachments:</label>
            <div className="attach-section">
              <AttachFile files={file} onChange={(newFiles) => setFile(newFiles)} required={true} maxFiles={5} label="Attach File" />
            </div>
          </div>

          <div className="button-row">
            <button type="submit" className="submit-btn">{editingIndex !== null ? "Update" : "Submit"}</button>
            <button type="button" className="reset-btn" onClick={() => {
              setEmployeeId(""); setEmployeeData({}); setReason(""); setContact(""); setStartDate(""); setEndDate("");
              setFile([]); setTravelDate(""); setDistance(""); setTaAmount(""); setTravelMode(""); setEditingIndex(null);
              setErrors({}); setSubmitAttempted(false); setSuccessMessage("");
            }}>Reset</button>
          </div>
        </form>
      </div>

      {applications.length > 0 && (
        <div className="submitted-section-wrapper">
          <div className="submitted-section">
            <h3>Submitted TA Applications</h3>
            <table className="applications-table">
              <thead>
                <tr><th>ApplnNo</th><th>Emp ID</th><th>Name</th><th>Travel Date</th><th>Distance</th><th>TA Amount</th><th>Files</th><th>Action</th></tr>
              </thead>
              <tbody>
                {applications.map((app, idx) => (
                  <tr key={app.ApplnNo}>
                    <td>{app.ApplnNo}</td>
                    <td>{app.empId}</td>
                    <td>{app.name}</td>
                    <td>{app.travelDate}</td>
                    <td>{app.distance}</td>
                    <td>{app.taAmount}</td>
                    <td>{app.files?.map((f,i)=> <div key={i}>{f.name}</div>)}</td>
                    <td><button className="edit-btn" onClick={()=>handleEdit(idx)}>Edit</button></td>
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

export default TAApplication;
