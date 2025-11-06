import React, { useState } from "react";
import MenteeDetailsModal from "./MenteeDetailsModal";

export default function MenteeTable({ mentees, onDelete }) {
  const [selectedMentee, setSelectedMentee] = useState(null);

  return (
    <div className="table-responsive mt-3 mentee-table-container">
      <table className="table mentee-table align-middle text-center mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Roll No</th>
            <th>Name</th>
            <th>Department</th>
            <th>Year</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {mentees?.length > 0 ? (
            mentees.map((mentee, index) => {
              const latestIssue =
                mentee.issues && mentee.issues.length > 0
                  ? mentee.issues[mentee.issues.length - 1]
                  : null;

              const statusClass = latestIssue
                ? latestIssue.status.toLowerCase()
                : "normal";

              return (
                <tr key={mentee._id}>
                  <td className="fw-semibold">{index + 1}</td>
                  <td className="fw-semibold">{mentee.rollNumber}</td>
                  <td>{mentee.name}</td>
                  <td className="text-info">{mentee.department}</td>
                  <td className="text-primary">{mentee.year}</td>
                  <td className={`status-cell ${statusClass}`}>
                    {latestIssue ? latestIssue.status.toUpperCase() : "NORMAL"}
                  </td>
                  <td className="text-center d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary fw-semibold d-inline-flex align-items-center gap-1"
                      onClick={() => setSelectedMentee(mentee)}
                    >
                      <i className="bi bi-eye-fill"></i> View
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger fw-semibold d-inline-flex align-items-center gap-1"
                      onClick={() => onDelete(mentee._id)}
                    >
                      <i className="bi bi-trash3-fill"></i> Delete
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="py-4 text-secondary">
                No mentees yet ✨
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedMentee && (
        <MenteeDetailsModal
          show={!!selectedMentee}
          onClose={() => setSelectedMentee(null)}
          mentee={selectedMentee}
          onUpdate={() => window.location.reload()}
        />
      )}
    </div>
  );
}
