import React, { useState } from "react";
import API from "../services/api";
import FileSaver from "file-saver";
import "../styles/theme.css";

export default function MenteeDetailsModal({ show, onClose, mentee, onUpdate }) {
  const [newIssue, setNewIssue] = useState("");
  const [updating, setUpdating] = useState(false);

  if (!show || !mentee) return null;

  const handleAddIssue = async () => {
    if (!newIssue.trim()) return alert("Please enter a follow-up or issue.");
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await API.post(`/mentor/add-issue/${mentee._id}`, { description: newIssue }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewIssue("");
      onUpdate?.();
    } catch (err) {
      console.error("❌ Error adding issue:", err);
      alert("Failed to add issue.");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (issueId, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "solved" : "pending";
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/mentor/update-issue/${issueId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate?.();
    } catch (err) {
      console.error("❌ Error updating issue:", err);
      alert("Failed to update issue status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadIndividualReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/mentor/generate-report/${mentee._id}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      FileSaver.saveAs(pdfBlob, `${mentee.name}_Report.pdf`);
    } catch (err) {
      console.error("❌ Error downloading mentee report:", err);
      alert("Failed to download mentee report.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 1055,
        overflowY: "auto",
      }}
    >
      <div
        className="modal-dialog modal-lg"
        style={{
          maxWidth: "720px",
          width: "90%",
          margin: "0 auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content text-light shadow-lg border border-info"
          style={{
            background: "linear-gradient(145deg, #0f172a, #1e293b, #334155)",
            borderRadius: "14px",
            boxShadow:
              "0 0 10px rgba(56,189,248,0.2), 0 0 25px rgba(30,64,175,0.3)",
          }}
        >
   
          <div
            className="modal-header border-0"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: "0.3rem",
            }}
          >
            <h5
              className="modal-title fw-bold"
              style={{ color: "#38bdf8", fontSize: "1.2rem" }}
            >
              {mentee.name} <span className="text-light">— {mentee.rollNumber}</span>
            </h5>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

 
          <div
            className="modal-body px-4 pt-3"
            style={{ maxHeight: "65vh", overflowY: "auto" }}
          >
            <div className="mb-3">
              <p className="mb-1">
                <strong>Department:</strong> {mentee.department}
              </p>
              <p className="mb-3">
                <strong>Year:</strong> {mentee.year}
              </p>
            </div>

            <h6 className="text-info fw-semibold mb-3">🕒 Follow-ups Timeline</h6>
            {mentee.issues?.length > 0 ? (
              <ul className="list-unstyled ps-2">
                {mentee.issues.map((issue) => (
                  <li
                    key={issue._id}
                    className="mb-3 p-2 rounded-3"
                    style={{
                      borderLeft: `4px solid ${
                        issue.status === "solved" ? "#4ade80" : "#f87171"
                      }`,
                      background: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <p className="mb-1 fw-semibold">
                      {issue.description}
                      <span
                        className={`badge ms-2 ${
                          issue.status === "solved"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          handleStatusChange(issue._id, issue.status)
                        }
                      >
                        {issue.status.toUpperCase()}
                      </span>
                    </p>
                    <small className="text-secondary">
                      {new Date(issue.createdAt).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-secondary">No follow-ups yet for this mentee.</p>
            )}

            <div className="mt-4">
              <h6 className="text-info fw-semibold mb-2">➕ Add New Follow-up</h6>
              <textarea
                className="form-control bg-dark text-light border-info shadow-sm"
                rows="3"
                placeholder="Write issue or feedback here..."
                value={newIssue}
                onChange={(e) => setNewIssue(e.target.value)}
              ></textarea>
            </div>
          </div>

     
          <div
            className="modal-footer border-0 d-flex justify-content-between align-items-center px-4"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "1rem",
              gap: "0.5rem",
            }}
          >
            <button
              className="btn btn-outline-light px-4 fw-semibold"
              onClick={onClose}
            >
              Close
            </button>

            <div className="d-flex gap-2">
              <button
                className="btn btn-info fw-semibold text-white px-4 shadow-sm"
                onClick={handleAddIssue}
                disabled={updating}
              >
                {updating ? "Adding..." : "Add Issue"}
              </button>

              <button
                className="btn btn-primary fw-semibold shadow-sm px-4"
                onClick={handleDownloadIndividualReport}
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
