import React, { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/theme.css";

export default function MenteeDetailsModal({ show, onClose, mentee, onUpdate }) {
  const [newIssue, setNewIssue] = useState("");
  const [issues, setIssues] = useState([]);
  const [updatingIssueId, setUpdatingIssueId] = useState(null);
  const [adding, setAdding] = useState(false);

  // ✅ Always call hooks first — never inside a conditional
  useEffect(() => {
    if (mentee) {
      setIssues(mentee.issues || []);
    }
  }, [mentee]);

  if (!mentee) return null;

  // 🔹 Add new follow-up (refresh + close modal)
  const handleAddIssue = async () => {
    if (!newIssue.trim()) return alert("Please enter a follow-up message!");
    setAdding(true);
    try {
      await API.post(`/mentor/add-issue/${mentee._id}`, { description: newIssue });
      alert("✅ Issue added successfully!");
      setNewIssue("");
      onUpdate(); // refresh dashboard data
      onClose(); // close modal automatically
    } catch (err) {
      console.error("❌ Error adding issue:", err);
      alert("Failed to add issue.");
    } finally {
      setAdding(false);
    }
  };

  // 🔹 Mark pending issue as solved (instant UI update)
  const handleMarkSolved = async (issueId) => {
    setUpdatingIssueId(issueId);
    try {
      await API.put(`/mentor/update-issue/${issueId}`, { status: "solved" });

      // Small delay for smooth UX
      setTimeout(() => {
        setIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId ? { ...issue, status: "solved" } : issue
          )
        );
        setUpdatingIssueId(null);
        onUpdate(); // refresh dashboard
      }, 1500);
    } catch (err) {
      console.error("❌ Error marking issue as solved:", err);
      alert("Failed to mark issue as solved.");
      setUpdatingIssueId(null);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await API.get(`/mentor/mentee-report/${mentee._id}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${mentee.name}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("❌ Error downloading mentee report:", err);
      alert("Failed to download report.");
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : "d-none"}`}
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(10px)",
        zIndex: 9999,
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "700px" }}>
        <div
          className="modal-content p-4 rounded-4 shadow-lg text-light"
          style={{
            background: "linear-gradient(145deg, #0f172a, #1e293b)",
            border: "1px solid #38bdf8",
            boxShadow: "0 0 20px rgba(56,189,248,0.4)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-info">
              {mentee.name} — {mentee.rollNumber}
            </h5>
            <button className="btn btn-sm btn-outline-light" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <p className="mb-1">
            <strong>Department:</strong> {mentee.department}
          </p>
          <p>
            <strong>Year:</strong> {mentee.year}
          </p>

          <h6 className="text-info mt-4 mb-2">
            <i className="bi bi-clock-history me-2"></i> Follow-ups Timeline
          </h6>

          {issues?.length > 0 ? (
            issues.map((issue, i) => (
              <div
                key={i}
                className="p-3 rounded mb-2"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderLeft: `4px solid ${
                    issue.status === "pending" ? "#fbbf24" : "#4ade80"
                  }`,
                  cursor:
                    issue.status === "pending" && !updatingIssueId
                      ? "pointer"
                      : "default",
                  opacity: updatingIssueId === issue._id ? 0.6 : 1,
                  transition: "all 0.3s ease",
                }}
                onClick={() =>
                  issue.status === "pending" &&
                  !updatingIssueId &&
                  handleMarkSolved(issue._id)
                }
                title={
                  issue.status === "pending"
                    ? "Click to mark as solved"
                    : "Already solved"
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    {updatingIssueId === issue._id
                      ? "⏳ Marking as solved..."
                      : issue.description}
                  </span>
                  <span
                    className={`badge ${
                      issue.status === "pending" ? "bg-warning" : "bg-success"
                    } text-dark`}
                  >
                    {issue.status.toUpperCase()}
                  </span>
                </div>
                <small className="text-secondary">
                  {new Date(issue.createdAt).toLocaleString()}
                </small>
              </div>
            ))
          ) : (
            <p className="text-muted">No follow-ups yet for this mentee.</p>
          )}

          <h6 className="text-info mt-3">
            <i className="bi bi-plus-circle me-2"></i> Add New Follow-up
          </h6>
          <textarea
            className="form-control bg-dark text-light border-info mt-2"
            rows="3"
            placeholder="Add a new follow-up or remark..."
            value={newIssue}
            onChange={(e) => setNewIssue(e.target.value)}
          ></textarea>

          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-outline-light px-4" onClick={onClose}>
              Close
            </button>
            <div className="d-flex gap-2">
              <button
                className="btn btn-info px-4"
                onClick={handleAddIssue}
                disabled={adding}
              >
                {adding ? "Adding..." : "Add Issue"}
              </button>
              <button
                className="btn btn-outline-info px-4"
                onClick={handleDownloadReport}
              >
                <i className="bi bi-download me-2"></i> Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
