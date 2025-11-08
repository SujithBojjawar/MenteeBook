import React, { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import MenteeTable from "../components/MenteeTable";
import AddMenteeModal from "../components/AddMenteeModal";
import BulkUploadModal from "../components/BulkUploadModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/theme.css";

export default function MentorDashboard() {
  const [mentor, setMentor] = useState(null);
  const [mentees, setMentees] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    setMentor(user);
    if (token && user) fetchMentees(token);
  }, []);

  const fetchMentees = async (token) => {
    try {
      const res = await API.get("/mentor/mentees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;

      let pendingCount = 0;
      let resolvedCount = 0;
      data.forEach((mentee) => {
        mentee.issues?.forEach((issue) => {
          if (issue.status === "pending") pendingCount++;
          else if (issue.status === "solved") resolvedCount++;
        });
      });

      setMentees(data);
      setStats({
        total: data.length,
        pending: pendingCount,
        resolved: resolvedCount,
      });
    } catch (err) {
      console.error("❌ Failed to fetch mentees:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete all mentees
  const handleDeleteAllMentees = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete all mentees? This action cannot be undone."
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await API.delete("/mentor/delete-all-mentees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ All mentees deleted successfully!");
      setMentees([]);
      setStats({ total: 0, pending: 0, resolved: 0 });
    } catch (err) {
      console.error("❌ Error deleting all mentees:", err);
      alert("Failed to delete all mentees.");
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Download report as PDF
  const handleDownloadPDF = () => {
    if (mentees.length === 0) return alert("No mentees to export.");

    const doc = new jsPDF("p", "pt", "a4");
    let yOffset = 60;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Mentor–Mentee Summary Report", 40, 40);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Mentor: ${mentor?.name || "N/A"}`, 40, yOffset);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 400, yOffset);
    yOffset += 30;

    doc.setDrawColor(56, 189, 248);
    doc.line(40, yOffset, 550, yOffset);
    yOffset += 25;

    mentees.forEach((mentee, index) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(56, 189, 248);
      doc.setFontSize(13);
      doc.text(`${index + 1}. ${mentee.name} (${mentee.rollNumber})`, 40, yOffset);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(33, 37, 41);
      doc.text(
        `Department: ${mentee.department} | Year: ${mentee.year}`,
        40,
        yOffset + 16
      );
      yOffset += 30;

      if (mentee.issues?.length > 0) {
        const rows = mentee.issues.map((issue, i) => [
          i + 1,
          issue.description || "No description provided",
          issue.status ? issue.status.toUpperCase() : "N/A",
          new Date(issue.updatedAt || issue.createdAt).toLocaleString(),
        ]);

        autoTable(doc, {
          startY: yOffset,
          head: [["#", "Description", "Status", "Date"]],
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
            cellPadding: 5,
          },
          alternateRowStyles: { fillColor: [240, 247, 255] },
          margin: { left: 40, right: 40 },
        });

        yOffset = doc.lastAutoTable.finalY + 25;
      } else {
        doc.setTextColor(120);
        doc.text("No issues or remarks available.", 50, yOffset);
        yOffset += 25;
      }

      if (yOffset > 700) {
        doc.addPage();
        yOffset = 60;
      }
    });

    doc.save(`${mentor?.name || "Mentor"}_Mentee_Report.pdf`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-black text-white">
        <h4 className="text-info">Loading Dashboard...</h4>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      <Navbar mentor={mentor} />

      <div className="container py-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary mb-3 mb-md-0">
            Welcome, {mentor?.name || "Mentor"} 👋
          </h2>

          <div className="d-flex gap-2">
            <button
              className="btn add-mentee-btn fw-semibold shadow"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-person-plus-fill me-2"></i>
              Add Mentee
            </button>

            <button
              className="btn btn-outline-success fw-semibold shadow-sm"
              onClick={() => setShowBulkModal(true)}
            >
              <i className="bi bi-upload me-2"></i>
              Upload CSV
            </button>

            <button
              className="btn btn-outline-primary fw-semibold shadow-sm"
              onClick={handleDownloadPDF}
            >
              <i className="bi bi-download me-2"></i> Download Report
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card stat-card text-center p-4 rounded-4 shadow-sm">
              <h5 className="stat-title mb-1">Total Mentees</h5>
              <h2 className="stat-number">{stats.total}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card stat-card text-center p-4 rounded-4 shadow-sm border-danger">
              <h5 className="stat-title text-danger mb-1">Pending</h5>
              <h2 className="stat-number text-danger">{stats.pending}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card stat-card text-center p-4 rounded-4 shadow-sm border-success">
              <h5 className="stat-title text-success mb-1">Resolved</h5>
              <h2 className="stat-number text-success">{stats.resolved}</h2>
            </div>
          </div>
        </div>

        {/* Mentee List */}
        <div className="card stat-card border-0 p-4 rounded-4 shadow">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="stat-title">Mentee List</h5>
          </div>

          {mentees.length > 0 ? (
            <MenteeTable mentees={mentees} />
          ) : (
            <div className="text-center text-secondary py-4">
              <i className="bi bi-person-lines-fill fs-1 mb-3 d-block"></i>
              <p>No mentees added yet. Click “Add Mentee” or “Upload CSV”.</p>
            </div>
          )}
        </div>

        {/* Delete All Button */}
        {mentees.length > 0 && (
          <div className="text-center mt-4">
            <button
              className="btn btn-danger fw-semibold px-4 shadow-sm"
              onClick={handleDeleteAllMentees}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "🗑️ Delete All Mentees"}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddMenteeModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={() => fetchMentees(localStorage.getItem("token"))}
      />

      <BulkUploadModal
        show={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onAdded={() => fetchMentees(localStorage.getItem("token"))}
      />
    </div>
  );
}
