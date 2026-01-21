import React from "react";
import "./ApprovalAuditView.css";

function ApprovalAuditView({ open, onClose, audit }) {
  if (!open || !audit) return null;

  return (
    <div className="audit-overlay" onClick={onClose}>
      <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Approval Audit Trail</h3>

        <div className="audit-header">
          <div><b>Application No:</b> {audit.applnNo}</div>
          <div><b>Current Status:</b> {audit.applicationStatus}</div>
        </div>

        <table className="audit-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Approver ID</th>
              <th>Approver Name</th>
              <th>Role</th>        {/* ✅ */}
              <th>Action</th>
              <th>Action Date</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Recommender 1</td>
              <td>{audit.rec1Id || "—"}</td>
              <td>{audit.rec1Name || "—"}</td>
              <td>{audit.rec1Role || "—"}</td>
              <td>{audit.rec1Action || "null"}</td>
              <td>{audit.rec1ActionDate || "—"}</td>
              <td>{audit.rec1Remarks || "—"}</td>
            </tr>

            <tr>
              <td>Recommender 2</td>
              <td>{audit.rec2Id || "—"}</td>
              <td>{audit.rec2Name || "—"}</td>
              <td>{audit.rec2Role || "—"}</td>
              <td>{audit.rec2Action || "null"}</td>
              <td>{audit.rec2ActionDate || "—"}</td>
              <td>{audit.rec2Remarks || "—"}</td>
            </tr>
          </tbody>
        </table>

        <div className="audit-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ApprovalAuditView;
