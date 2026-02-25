import React from "react";
import AdminRequestsPage from "./AdminRequestsPage";
import {formatFileNameForDisplay} from "../../Shared/fileNameUtils";

const AdminLTCRequests = () => {
  return (
    <AdminRequestsPage
      title="LTC Requests"
      baseUrl="/api/ltc/approvals"
      entityLabel="LTC requests"
      renderDetails={(req) => (
        <>
          <p>
            <strong>Employee:</strong> {req.name} ({req.empId})
          </p>
          {/* Example fields – adjust to your LTCApplication */}
          {req.fromPlace && req.toPlace && (
            <p>
              <strong>Journey:</strong> {req.fromPlace} → {req.toPlace}
            </p>
          )}
          {req.startDate && req.endDate && (
            <p>
              <strong>Travel Dates:</strong> {req.startDate} — {req.endDate}
            </p>
          )}
          {req.familyMembers && (
            <p>
              <strong>Family Members:</strong> {req.familyMembers}</p>
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
                            `http://localhost:8080/api/files/view?module=ltc&empId=${req.empId}&fileName=${fn}`,
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

export default AdminLTCRequests;
