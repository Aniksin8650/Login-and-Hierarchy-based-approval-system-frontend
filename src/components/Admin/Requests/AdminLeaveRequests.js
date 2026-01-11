import React from "react";
import AdminRequestsPage from "./AdminRequestsPage";
import {formatFileNameForDisplay} from "../../Shared/fileNameUtils"

const AdminLeave = () => {
  return (
    <AdminRequestsPage
      title="Leave Requests"
      baseUrl="/api/leave/approvals"   // 🔴 CHANGED
      entityLabel="leave requests"
      renderDetails={(req) => (
        <>
          <p>
            <strong>Employee:</strong> {req.name} ({req.empId})
          </p>
          <p>
            <strong>From:</strong> {req.startDate} —{" "}
            <strong>To:</strong> {req.endDate}
          </p>
          <p>
            <strong>Reason:</strong> {req.reason}
          </p>
          {req.applicationType && (
            <p>
              <strong>Type:</strong> {req.applicationType}
            </p>
          )}
          {req.applnNo && (
            <p>
              <strong>Appln No:</strong> {req.applnNo}
            </p>
          )}
          {req.fileName && (
            <div className="attachments">
              <strong>Attachments:</strong>
              <ul>
                {req.fileName.split(";").map((fn) => (
                  <li key={fn}>
                    <a
                      href={`http://localhost:8080/api/files/view?module=leave&empId=${req.empId}&fileName=${fn}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📎 {formatFileNameForDisplay(fn)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    />
  );
};

export default AdminLeave;
