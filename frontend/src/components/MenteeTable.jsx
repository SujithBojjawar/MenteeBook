import React from "react";

export default function MenteeTable({ mentees, onView, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover align-middle text-center">
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
          {mentees.map((mentee, index) => (
            <tr key={mentee._id}>
              <td>{index + 1}</td>
              <td className="fw-semibold text-info">{mentee.rollNumber}</td>
              <td>{mentee.name}</td>
              <td>{mentee.department}</td>
              <td>{mentee.year}</td>
              <td className={mentee.issues?.some(i => i.status === "pending") ? "text-warning fw-bold" : "text-success fw-bold"}>
                {mentee.issues?.some(i => i.status === "pending") ? "PENDING" : "NORMAL"}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-info me-2"
                  onClick={() => onView(mentee)}
                >
                  <i className="bi bi-eye"></i> View
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(mentee._id)}
                >
                  <i className="bi bi-trash"></i> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
