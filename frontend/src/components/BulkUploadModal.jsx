import React, { useState } from "react";
import API from "../services/api";
import "../components/AddMenteeModal.css"; // reuse your existing modal styles

export default function BulkUploadModal({ show, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  // Handles CSV file upload
  const handleUpload = async () => {
    try {
      if (!file) {
        alert("⚠️ Please select a CSV file first!");
        return;
      }

      const text = await file.text();
      const rows = text
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      const mentees = [];

      // Skip header row automatically
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(",").map((c) => c.trim());
        if (cols.length >= 4) {
          mentees.push({
            rollNumber: cols[0],
            name: cols[1],
            department: cols[2],
            year: cols[3],
          });
        }
      }

      if (mentees.length === 0) {
        alert(
          "⚠️ Invalid CSV format.\nExpected columns:\nrollNumber,name,department,year"
        );
        return;
      }

      setLoading(true);
      const token = localStorage.getItem("token");

      await API.post(
        "/mentor/add-bulk-mentees",
        { mentees },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`✅ Successfully added ${mentees.length} mentees!`);
      onUploaded();
      onClose();
    } catch (err) {
      console.error("❌ Error uploading mentees:", err);
      alert("❌ Failed to upload CSV. Please check the file format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-modal-overlay fade-in" onClick={onClose}>
      <div
        className="custom-modal-content slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="fw-bold suit-accent mb-3 text-center">
          Upload Mentees from CSV
        </h4>

        <div className="mb-3">
          <input
            type="file"
            accept=".csv"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <small className="text-muted">
            Format: <code>rollNumber,name,department,year</code>
          </small>
        </div>

        <div className="d-flex justify-content-end gap-3 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary fw-semibold px-4"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary fw-semibold px-4"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
