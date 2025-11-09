import React, { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import MenteeTable from "../components/MenteeTable";
import AddMenteeModal from "../components/AddMenteeModal";
import BulkUploadModal from "../components/BulkUploadModal";
import "../styles/theme.css";

export default function MentorDashboard() {
  const [mentor, setMentor] = useState(null);
  const [mentees, setMentees] = useState([]);
  const [filteredMentees, setFilteredMentees] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    setMentor(user);
    if (token && user) fetchMentees(token);
  }, []);

  // ✅ Fetch all mentees
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
      setFilteredMentees(data);
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

  // ✅ Search mentees by name or roll number
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (!term.trim()) setFilteredMentees(mentees);
    else {
      const filtered = mentees.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.rollNumber.toString().toLowerCase().includes(term)
      );
      setFilteredMentees(filtered);
    }
  };

  // ✅ Delete individual mentee
  const handleDeleteMentee = async (menteeId) => {
    const confirmDelete = window.confirm("⚠️ Are you sure you want to delete this mentee?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/mentor/delete-mentee/${menteeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Mentee deleted successfully!");
      fetchMentees(token);
    } catch (err) {
      console.error("❌ Error deleting mentee:", err);
      alert("Failed to delete mentee. Try again!");
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
      setFilteredMentees([]);
      setStats({ total: 0, pending: 0, resolved: 0 });
    } catch (err) {
      console.error("❌ Error deleting all mentees:", err);
      alert("Failed to delete all mentees.");
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Download full mentor report
  const handleDownloadReport = async () => {
    try {
      const response = await API.get("/mentor/generate-report", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${mentor?.name || "Mentor"}_Full_Mentee_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("❌ Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-light">
        <div className="spinner-border text-info me-3"></div>
        <h4>Loading Mentor Dashboard...</h4>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 fade-in"
      style={{
        background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
        color: "white",
        overflowX: "hidden",
      }}
    >
      <Navbar mentor={mentor} />

      <div className="container py-5">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-3 mb-md-0">
            👋 Welcome back, <span className="text-info">{mentor?.name}</span>
          </h2>
          <div className="d-flex gap-2">
            <button
              className="btn btn-success fw-semibold shadow-sm"
              onClick={() => setShowBulkModal(true)}
            >
              <i className="bi bi-upload me-2"></i> Upload CSV
            </button>
            <button
              className="btn btn-primary fw-semibold shadow-sm"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-person-plus me-2"></i> Add Mentee
            </button>
            <button
              className="btn btn-outline-light fw-semibold shadow-sm"
              onClick={handleDownloadReport}
            >
              <i className="bi bi-download me-2"></i> Download Report
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="row g-4 mb-4">
          {[
            { label: "Total Mentees", value: stats.total, color: "#38bdf8" },
            { label: "Pending Issues", value: stats.pending, color: "#f87171" },
            { label: "Resolved", value: stats.resolved, color: "#4ade80" },
          ].map((s, idx) => (
            <div className="col-md-4" key={idx}>
              <div
                className="card border-0 shadow-sm text-center p-4 rounded-4"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${s.color}`,
                }}
              >
                <h6 style={{ color: s.color }}>{s.label}</h6>
                <h2 className="fw-bold">{s.value}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="d-flex justify-content-end mb-3">
          <input
            type="text"
            placeholder="🔍 Search by name or roll number..."
            className="form-control shadow-sm"
            style={{
              width: "350px",
              borderRadius: "30px",
              border: "1px solid #38bdf8",
              background: "rgba(255,255,255,0.1)",
              color: "white",
            }}
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Mentee Table */}
        <div
          className="card border-0 rounded-4 shadow p-4"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold text-info">📋 Mentee List</h5>
          </div>

          {filteredMentees.length > 0 ? (
            <MenteeTable mentees={filteredMentees} onDelete={handleDeleteMentee} />
          ) : (
            <div className="text-center text-secondary py-5">
              <i className="bi bi-person-x fs-1 mb-3 d-block"></i>
              <p>No mentees found. Try a different search.</p>
            </div>
          )}
        </div>

        {/* Delete All Button */}
        {mentees.length > 0 && (
          <div className="text-center mt-4">
            <button
              className="btn btn-danger px-4 py-2 rounded-3 fw-semibold shadow"
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
        onUploaded={() => fetchMentees(localStorage.getItem("token"))}
      />
    </div>
  );
}
