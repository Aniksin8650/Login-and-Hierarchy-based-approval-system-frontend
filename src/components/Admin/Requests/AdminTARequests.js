import React from "react";
import AdminRequestsPage from "./AdminRequestsPage";

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
        </>
      )}
    />
  );
};

export default AdminTARequests;
