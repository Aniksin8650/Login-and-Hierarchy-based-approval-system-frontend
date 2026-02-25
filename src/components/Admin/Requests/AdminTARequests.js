import React from "react";
import AdminRequestsPage from "./AdminRequestsPage";
import { formatFileNameForDisplay } from "../../Shared/fileNameUtils";

const AdminTARequests = () => {
  return (
    <AdminRequestsPage
      title="TA Requests"
      baseUrl="/api/ta/approvals"
      entityLabel="TA requests"
      renderDetails={(req) => (
        <>
          <p>
            <strong>Employee:</strong> {req.name} ({req.empId})
          </p>
          {/* Adjust these according to your TAApplication fields */}
          {req.fromPlace && req.toPlace && (
            <p>
              <strong>Journey:</strong> {req.fromPlace} → {req.toPlace}
            </p>
          )}
          {req.journeyDate && (
            <p>
              <strong>Journey Date:</strong> {req.journeyDate}
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
                            `http://localhost:8080/api/files/view?module=ta&empId=${req.empId}&fileName=${fn}`,
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

export default AdminTARequests;
