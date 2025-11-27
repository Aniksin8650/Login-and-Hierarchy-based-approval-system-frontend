import React, { useState, useEffect } from "react";
import "./LTCApplication.css";
import "../Shared/AttachFile.css";
import { useLocation } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

import AttachFile from "../Shared/AttachFile";

function LTCApplication() {
  const location = useLocation();
  const { applicationType } = location.state || { applicationType: "ltc" };
  // const navigate = useNavigate();

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
  //   if (!id) { setEmployeeData({}); return; }
  //   try {
  //     const res = await fetch(`http://localhost:8080/api/employees/id/${id}`);
  //     if (res.ok) { const data = await res.json(); setEmployeeData(data); } else setEmployeeData({});
  //   } catch (err) { console.error("Error fetching employee:", err); setEmployeeData({}); }
  // };

  const getInputClass = (field) => submitAttempted && errors[field] ? "input-error" : "";

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

    // LTC-specific
    if (!destination.trim()) newErrors.destination = true;
    if (!familyCount || isNaN(parseInt(familyCount))) newErrors.familyCount = true;
    if (!claimYear || !/^\d{4}$/.test(claimYear)) newErrors.claimYear = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) { alert("Please fix errors before submitting."); return; }

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

    // LTC-specific
    formData.append("destination", destination);
    formData.append("familyCount", familyCount);
    formData.append("claimYear", claimYear);

    file.filter((f) => !f.isServerFile).forEach((f) => formData.append("files", f));
    const retainedFiles = file.filter((f) => f.isServerFile).map((f) => f.name).join(";");
    formData.append("retainedFiles", retainedFiles);

    const ApplnNo = editingIndex !== null ? applications[editingIndex].ApplnNo : `LTC-${Date.now()}`;
    formData.append("ApplnNo", ApplnNo);

    try {
      const url = editingIndex !== null ? `http://localhost:8080/api/ltc/update/${ApplnNo}` : "http://localhost:8080/api/ltc/submit";
      const method = editingIndex !== null ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });

      if (res.status === 409) { const msg = await res.text(); alert(msg); return; }

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
          destination,
          familyCount,
          claimYear,
          files: file.map((f) => ({ name: f.name, type: f.type || "server-file" })),
        };

        if (editingIndex !== null) {
          const updated = [...applications]; updated[editingIndex] = newApp; setApplications(updated); setEditingIndex(null); setSuccessMessage("LTC application updated!");
        } else { setApplications((prev) => [...prev, newApp]); setSuccessMessage("LTC application submitted!"); }

        setTimeout(() => setSuccessMessage(""), 5000);

        setEmployeeId(""); setEmployeeData({}); setReason(""); setContact(""); setStartDate(""); setEndDate("");
        setFile([]); setDestination(""); setFamilyCount(""); setClaimYear(""); setErrors({}); setSubmitAttempted(false);
      } else { alert("Failed to submit LTC application."); }
    } catch (err) {
      console.error("Error submitting LTC:", err);
      alert("Server error.");
    }
  };

  const handleEdit = async (index) => {
    const app = applications[index];
    setEmployeeId(app.empId);
    setEmployeeData({ empId: app.empId, name: app.name, department: app.department, designation: app.designation });
    setReason(app.reason);
    setStartDate(app.startDate);
    setEndDate(app.endDate);
    setContact(app.contact);
    setDestination(app.destination || "");
    setFamilyCount(app.familyCount || "");
    setClaimYear(app.claimYear || "");
    setEditingIndex(index);

    try {
      const res = await fetch(`http://localhost:8080/api/ltc/ApplnNo/${app.ApplnNo}`);
      if (res.ok) {
        const data = await res.json();
        if (data.fileName) {
          const filesFromServer = data.fileName.split(";").filter(Boolean).map((name) => ({
            name,
            url: `http://localhost:8080/uploads/${data.applicationType}/${data.empId}/${name}`,
            isServerFile: true,
          }));
          setFile(filesFromServer);
        } else setFile([]);
      }
    } catch (err) { console.error("Error fetching LTC files:", err); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="ltc-container">
        <h2>LTC Application</h2>

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

          <div className="form-row"><label>Application Type:</label><input type="text" value={applicationType.toUpperCase()} readOnly /></div>
          <div className="form-row"><label>Name:</label><input type="text" value={employeeData.name || ""} readOnly /></div>
          <div className="form-row"><label>Department:</label><input type="text" value={employeeData.department || ""} readOnly /></div>
          <div className="form-row"><label>Designation:</label><input type="text" value={employeeData.designation || ""} readOnly /></div>

          <div className="form-row"><label>Reason:</label><input type="text" value={reason} onChange={(e)=>setReason(e.target.value)} className={getInputClass("reason")} /></div>

          <div className="form-row"><label>Start Date:</label><input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className={getInputClass("startDate")} /></div>
          <div className="form-row"><label>End Date:</label><input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className={getInputClass("endDate")} /></div>

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
          {/* LTC-specific */}
          <div className="form-row"><label>Destination:</label><input type="text" value={destination} onChange={(e)=>setDestination(e.target.value)} className={getInputClass("destination")} /></div>
          <div className="form-row"><label>Family Members:</label><input type="text" value={familyCount} onChange={(e)=>setFamilyCount(e.target.value.replace(/[^\d]/g,""))} className={getInputClass("familyCount")} /></div>
          <div className="form-row"><label>Claim Year:</label><input type="text" value={claimYear} onChange={(e)=>setClaimYear(e.target.value.replace(/[^\d]/g,""))} className={getInputClass("claimYear")} /></div>

          <div className="form-row attach-row"><label>Attachments:</label><div className="attach-section"><AttachFile files={file} onChange={(newFiles)=>setFile(newFiles)} required={true} maxFiles={5} label="Attach File" /></div></div>

          <div className="button-row"><button type="submit" className="submit-btn">{editingIndex !== null ? "Update" : "Submit"}</button>
            <button type="button" className="reset-btn" onClick={()=>{ setEmployeeId(""); setEmployeeData({}); setReason(""); setContact(""); setStartDate(""); setEndDate(""); setFile([]); setDestination(""); setFamilyCount(""); setClaimYear(""); setEditingIndex(null); setErrors({}); setSubmitAttempted(false); setSuccessMessage(""); }}>Reset</button>
          </div>
        </form>
      </div>

      {applications.length > 0 && (
        <div className="submitted-section-wrapper">
          <div className="submitted-section">
            <h3>Submitted LTC Applications</h3>
            <table className="applications-table">
              <thead><tr><th>ApplnNo</th><th>Emp ID</th><th>Name</th><th>Destination</th><th>Family</th><th>Claim Year</th><th>Files</th><th>Action</th></tr></thead>
              <tbody>{applications.map((app, idx)=> (<tr key={app.ApplnNo}><td>{app.ApplnNo}</td><td>{app.empId}</td><td>{app.name}</td><td>{app.destination}</td><td>{app.familyCount}</td><td>{app.claimYear}</td><td>{app.files?.map((f,i)=><div key={i}>{f.name}</div>)}</td><td><button className="edit-btn" onClick={()=>handleEdit(idx)}>Edit</button></td></tr>))}</tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default LTCApplication;
