import React from "react";
import AdminRequestsPage from "./AdminRequestsPage";
import {formatFileNameForDisplay} from "../../Shared/fileNameUtils";

const AdminDARequests = () => {
  return (
    <AdminRequestsPage
      title="DA Requests"
      baseUrl="/api/da/approvals"
      entityLabel="DA requests"
      renderDetails={(req) => (
        <>
          <p>
            <strong>Employee:</strong> {req.name} ({req.empId})
          </p>
          {/* Example fields – adjust to your DAApplication */}
          {req.fromDate && req.toDate && (
            <p>
              <strong>From:</strong> {req.fromDate} — <strong>To:</strong>{" "}
              {req.toDate}
            </p>
          )}
          {req.location && (
            <p>
              <strong>Location:</strong> {req.location}
            </p>
          )}
          {req.amount && (
            <p>
              <strong>Claim Amount:</strong> ₹{req.amount}
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
                            `http://localhost:8080/api/files/view?module=da&empId=${req.empId}&fileName=${fn}`,
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

export default AdminDARequests;
