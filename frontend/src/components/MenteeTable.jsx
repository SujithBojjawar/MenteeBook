import React, { useState } from "react";
import MenteeDetailsModal from "./MenteeDetailsModal";

export default function MenteeTable({ mentees, onDelete }) {
  const [selectedMentee, setSelectedMentee] = useState(null);

  return (
    <div className="table-responsive mentee-table-container">
      <table className="table table-hover align-middle text-center mb-0 mentee-table shadow-sm">
        <thead className="table-light">
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
                mentee.issues?.length > 0
                  ? mentee.issues[mentee.issues.length - 1]
                  : null;

              const statusClass = latestIssue
                ? latestIssue.status.toLowerCase()
                : "normal";

              return (
                <tr key={mentee._id}>
                  <td>{index + 1}</td>
                  <td className="fw-semibold">{mentee.rollNumber}</td>
                  <td>{mentee.name}</td>
                  <td>{mentee.department}</td>
                  <td>{mentee.year}</td>
                  <td className={`status-cell ${statusClass}`}>
                    {latestIssue ? latestIssue.status.toUpperCase() : "NORMAL"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => setSelectedMentee(mentee)}
                    >
                      <i className="bi bi-eye-fill"></i> View
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
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
              <td colSpan="7" className="py-4 text-muted">
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
