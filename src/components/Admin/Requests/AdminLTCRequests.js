import React from "react";
import AdminRequestsPage from "./AdminRequestsPage";

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
        </>
      )}
    />
  );
};

export default AdminLTCRequests;
