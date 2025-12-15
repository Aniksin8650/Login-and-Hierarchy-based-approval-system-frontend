import React, { useState } from "react";
import "./RoleSelectModal.css";

export default function RoleSelectModal({ roles, onConfirm, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <div className="role-modal-backdrop">
      <div className="role-modal">
        <h3>Select Role</h3>

        <div className="role-list">
          {roles.map((r, idx) => (
            <div
              key={idx}
              className={`role-item ${
                selectedIndex === idx ? "selected" : ""
              }`}
              onClick={() => setSelectedIndex(idx)}
            >
              <strong>{r.roleName}</strong>
              <div className="role-sub">
                {r.directorate} / {r.division}
              </div>
            </div>
          ))}
        </div>

        <div className="role-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button
            disabled={selectedIndex === null}
            onClick={() => onConfirm(roles[selectedIndex])}
            className="confirm-btn"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
