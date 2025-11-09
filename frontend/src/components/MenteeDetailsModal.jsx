import React, { useState } from "react";
import API from "../services/api";
import "../styles/theme.css";

export default function MenteeDetailsModal({ show, onClose, mentee, onUpdate }) {
  const [issueText, setIssueText] = useState("");
  const [updating, setUpdating] = useState(false);

  if (!show || !mentee) return null;

  const handleAddIssue = async (e) => {
    e.preventDefault();
    if (!issueText.trim()) return alert("Please enter issue description.");

    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/mentor/add-issue/${mentee._id}`,
        { description: issueText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIssueText("");
      onUpdate();
    } catch (error) {
      console.error("❌ Error adding issue:", error);
      alert("Failed to add issue.");
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/mentor/update-issue/${issueId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate();
    } catch (err) {
      console.error("❌ Error updating issue:", err);
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="modal-overlay d-flex align-items-center justify-content-center fade show">
      <div className="mentee-modal card shadow-lg border-0">
        <div className="modal-header border-0 pb-0">
          <h4 className="fw-bold text-primary mb-0">
            {mentee.name} <small className="text-muted">({mentee.rollNumber})</small>
          </h4>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>

        <div className="modal-body">
          <div className="mb-3">
            <p className="mb-1">
              <strong>Department:</strong> {mentee.department}
            </p>
            <p className="mb-1">
              <strong>Year:</strong> {mentee.year}
            </p>
          </div>

          <hr />

          <h5 className="fw-semibold text-primary mb-3">Follow-up Timeline</h5>

          <div className="timeline-container">
            {mentee.issues && mentee.issues.length > 0 ? (
              mentee.issues.map((issue, idx) => (
                <div className="timeline-item mb-3" key={idx}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="fw-semibold mb-1">{issue.description}</p>
                      <select
                        className={`form-select form-select-sm status-dropdown ${
                          issue.status === "solved" ? "status-solved" : "status-pending"
                        }`}
                        value={issue.status}
                        onChange={(e) =>
                          handleStatusChange(issue._id, e.target.value)
                        }
                        disabled={updating}
                      >
                        <option value="pending">Pending</option>
                        <option value="solved">Solved</option>
                      </select>
                    </div>
                    <small className="text-muted">
                      {new Date(issue.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No issues added yet.</p>
            )}
          </div>

          <form onSubmit={handleAddIssue} className="mt-4">
            <textarea
              className="form-control mb-3"
              rows="3"
              placeholder="Add a new follow-up or remark..."
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
            ></textarea>
            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold"
              disabled={updating}
            >
              {updating ? "Updating..." : "Add Issue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
