import React from "react";
import AdminRequestsPage from "./AdminRequestsPage";
import { formatFileNameForDisplay } from "../../Shared/fileNameUtils";

const AdminLeave = () => {
  return (
    <AdminRequestsPage
      title="Leave Requests"
      baseUrl="/api/leave/approvals"
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
                    <span
                      className="attachment-link"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");

                          const response = await fetch(
                            `http://localhost:8080/api/files/view?module=leave&empId=${req.empId}&fileName=${fn}`,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          if (!response.ok) {
                            alert("Unable to open file.");
                            return;
                          }

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          window.open(url, "_blank");
                        } catch (err) {
                          alert("Error opening file.");
                        }
                      }}
                    >
                      📎 {formatFileNameForDisplay(fn)}
                    </span>
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