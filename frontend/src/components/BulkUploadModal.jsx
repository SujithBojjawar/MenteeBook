import React, { useState } from "react";
import Papa from "papaparse";
import API from "../services/api";

export default function BulkUploadModal({ show, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          let mentees = result.data.map((m) => {
            const raw = Object.values(m).join(" ").trim();

            const parts = raw.split(/[\s,]+/).filter(Boolean);

            if (parts.length >= 4) {
              return {
                rollNumber: parts[0].replace(/"/g, "").trim(),
                name: parts.slice(1, -2).join(" ").replace(/"/g, "").trim(),
                department: parts[parts.length - 2].replace(/"/g, "").trim(),
                year: parts[parts.length - 1].replace(/"/g, "").trim(),
              };
            } else {
              
              return {
                rollNumber: m.rollNumber?.replace(/"/g, "").trim(),
                name: m.name?.replace(/"/g, "").trim(),
                department: m.department?.replace(/"/g, "").trim(),
                year: m.year?.replace(/"/g, "").trim(),
              };
            }
          });

        
          mentees = mentees.filter(
            (m) => m.rollNumber && m.name && m.department && m.year
          );

          if (mentees.length === 0) {
            alert("No valid mentee data found in the file.");
            setLoading(false);
            return;
          }

          const token = localStorage.getItem("token");
          await API.post(
            "/mentor/add-bulk-mentees",
            { mentees },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          alert("✅ Mentees uploaded successfully!");
          onUploaded?.(); 
          onClose();
        } catch (err) {
          console.error("❌ Error uploading mentees:", err);
          alert("Failed to upload CSV. Please check the file format.");
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        console.error("❌ CSV Parse Error:", err);
        alert("Error reading CSV file.");
        setLoading(false);
      },
    });
  };

  return (
    <div
      className="custom-modal-overlay fade-in"
      onClick={onClose}
    >
      <div
        className="custom-modal-content slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="fw-bold suit-accent mb-3 text-center">
          Upload Mentees via CSV
        </h4>

        <input
          type="file"
          accept=".csv"
          className="form-control mb-3"
          onChange={handleFileChange}
        />

        <div className="text-center mt-4">
          <button
            className="btn btn-secondary me-3 px-4"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary px-4"
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
