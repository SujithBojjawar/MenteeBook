import React, { useState } from "react";
import "../components/AddMenteeModal.css";
import API from "../services/api";

export default function AddMenteeModal({ show, onClose, onAdded }) {
  const [rollNumber, setRollNumber] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [year, setYear] = useState("1");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/mentor/add-mentee",
        { rollNumber, name, department, year },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Mentee added successfully!");
      onAdded();
      onClose();
    } catch (err) {
      console.error("Error adding mentee:", err);
      alert("❌ Failed to add mentee.");
    } finally {
      setLoading(false);
    }
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
          Add New Mentee
        </h4>

        <form onSubmit={handleSubmit}>
          {}
          <div className="form-floating mb-3">
            <input
              type="text"
              id="rollNumber"
              className="form-control"
              placeholder="Roll Number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
            />
            <label htmlFor="rollNumber">Roll Number</label>
          </div>

          {}
          <div className="form-floating mb-3">
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="name">Full Name</label>
          </div>

          {}
          <div className="form-floating mb-3">
            <select
              id="department"
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="AI-DS">AI-DS</option>
            </select>
            <label htmlFor="department">Department</label>
          </div>

          {}
          <div className="form-floating mb-4">
            <select
              id="year"
              className="form-select"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <label htmlFor="year">Year</label>
          </div>

          {}
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
              type="submit"
              className="btn btn-primary fw-semibold px-4"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Mentee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
