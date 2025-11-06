import React, { useState, useEffect } from "react";
import API from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import "../styles/theme.css";

function MenteeDetailsModal({ show, onClose, mentee, onUpdate }) {
  const [status, setStatus] = useState(mentee?.issues?.[0]?.status || "pending");
  const [newRemark, setNewRemark] = useState("");
  const [updating, setUpdating] = useState(false);
  const [remarks, setRemarks] = useState(mentee?.issues || []);

  useEffect(() => {
    if (mentee?.issues) {
      setRemarks(mentee.issues);
      if (mentee.issues[0]) {
        setStatus(mentee.issues[0].status || "pending");
      }
    }
  }, [mentee]);

  if (!show || !mentee) return null;

  const issue = mentee?.issues?.[0];

  const handleStatusChange = async () => {
    if (!issue?._id) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/mentor/update-issue/${issue._id}`,
        { status: status === "pending" ? "solved" : "pending" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus(status === "pending" ? "solved" : "pending");
      onUpdate();
    } catch (err) {
      console.error("❌ Error updating issue:", err);
      alert("Failed to update issue status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddRemark = async () => {
    if (!newRemark.trim()) return alert("Please enter a remark or follow-up.");
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/mentor/add-issue/${mentee._id}`,
        { description: newRemark },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRemarks((prev) => [...prev, res.data.newIssue]);
      setNewRemark("");
      onUpdate();
    } catch (err) {
      console.error("❌ Error adding remark:", err);
      alert("Failed to add remark.");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemarkStatusChange = async (issueId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.put(
        `/mentor/update-issue/${issueId}`,
        { status: currentStatus === "pending" ? "solved" : "pending" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRemarks((prev) =>
        prev.map((issue) =>
          issue._id === issueId
            ? { ...issue, status: res.data.updated.status }
            : issue
        )
      );
      onUpdate();
    } catch (err) {
      console.error("❌ Error updating remark status:", err);
      alert("Failed to update remark status.");
    }
  };

  const handleDownloadMenteePDF = () => {
    if (!mentee) return;

    try {
      const { name, rollNumber, department, year } = mentee;
      const doc = new jsPDF("p", "pt", "a4"); 
      const titleY = 40;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Mentor–Mentee Report", 40, titleY);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${name}`, 40, titleY + 25);
      doc.text(`Roll No: ${rollNumber}`, 40, titleY + 45);
      doc.text(`Department: ${department}`, 300, titleY + 25);
      doc.text(`Year: ${year}`, 300, titleY + 45);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, titleY + 65);

      doc.setDrawColor(56, 189, 248);
      doc.setLineWidth(1);
      doc.line(40, titleY + 75, 550, titleY + 75);

      if (remarks && remarks.length > 0) {
        const rows = remarks.map((issue, i) => [
          i + 1,
          issue.description || "No description provided",
          issue.status ? issue.status.toUpperCase() : "N/A",
          new Date(issue.updatedAt || issue.createdAt).toLocaleString(),
        ]);

        autoTable(doc, {
          startY: titleY + 95,
          head: [["#", "Remark / Follow-up", "Status", "Date"]],
          body: rows,
          theme: "grid",
          headStyles: {
            fillColor: [56, 189, 248],
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
          },
          styles: {
            fontSize: 10,
            cellPadding: 6,
            valign: "middle",
          },
          bodyStyles: {
            textColor: [33, 37, 41],
          },
          alternateRowStyles: { fillColor: [245, 249, 255] },
          margin: { left: 40, right: 40 },
        });
      } else {
        doc.setFontSize(12);
        doc.text("No remarks or issues found for this mentee.", 40, titleY + 110);
      }

      doc.save(`${name}_MentorMentee_Report.pdf`);
    } catch (err) {
      console.error("❌ Error generating PDF:", err);
      alert("Failed to generate PDF. See console for details.");
    }
  };

  return (
    <div className="mentee-modal-overlay fade-in" onClick={onClose}>
      <div
        className="mentee-modal-box slide-up text-light"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--modal-bg, #1e293b)",
          borderRadius: "16px",
          padding: "25px",
          width: "90%",
          maxWidth: "720px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 8px 40px rgba(56,189,248,0.15)",
        }}
      >
        {}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold suit-accent mb-0">{mentee.name}'s Details</h4>
          <button className="btn-close btn-close-white" onClick={onClose}></button>
        </div>

        {}
        <div className="mb-3">
          <p>
            <strong>Roll No:</strong>{" "}
            <span className="text-info">{mentee.rollNumber}</span>
          </p>
          <p>
            <strong>Department:</strong>{" "}
            <span className="text-info">{mentee.department}</span>
          </p>
          <p>
            <strong>Year:</strong>{" "}
            <span className="text-primary">{mentee.year}</span>
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`fw-semibold ${
                status === "solved"
                  ? "text-success"
                  : status === "pending"
                  ? "text-danger"
                  : "text-secondary"
              }`}
            >
              {status.toUpperCase()}
            </span>
          </p>
        </div>

        {}
        <div className="mb-4">
          <h6 className="fw-bold text-info mb-2">Add Follow-up / Remark</h6>
          <textarea
            className="form-control mb-2"
            rows="3"
            value={newRemark}
            onChange={(e) => setNewRemark(e.target.value)}
            placeholder="Write a follow-up or note..."
            style={{
              resize: "vertical",
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "10px",
              color: "#f8fafc",
            }}
          />
          <button
            className="btn btn-outline-primary fw-semibold px-4"
            onClick={handleAddRemark}
            disabled={updating}
          >
            {updating ? "Saving..." : "Add Remark"}
          </button>
        </div>

        {}
        <div className="mb-4">
          <h6 className="fw-bold text-info mb-3">Past Remarks / Follow-ups</h6>
          {remarks && remarks.length > 0 ? (
            <div className="timeline-container">
              {remarks.map((issue, index) => (
                <div key={issue._id || index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <p className="fw-semibold mb-1">{issue.description}</p>
                    <small className="text-secondary">
                      {new Date(issue.updatedAt || issue.createdAt).toLocaleString()}
                    </small>
                    <div className="mt-2">
                      <select
                        value={issue.status}
                        onChange={() =>
                          handleRemarkStatusChange(issue._id, issue.status)
                        }
                        className="form-select form-select-sm w-auto"
                        style={{
                          backgroundColor: "#0f172a",
                          color: "#f8fafc",
                          border: "1px solid #334155",
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="solved">Solved</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary">No remarks added yet.</p>
          )}
        </div>

        {}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <button
            className="btn btn-outline-primary px-4 fw-semibold"
            onClick={handleDownloadMenteePDF}
          >
            <i className="bi bi-download me-2"></i> Download Report
          </button>
          <button
            className="btn btn-outline-secondary px-4 fw-semibold"
            onClick={onClose}
            disabled={updating}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenteeDetailsModal;
