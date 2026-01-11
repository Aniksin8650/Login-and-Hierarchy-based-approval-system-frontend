import React from "react";
import AdminRequestsPage from "./AdminRequestsPage";

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
        </>
      )}
    />
  );
};

export default AdminDARequests;
