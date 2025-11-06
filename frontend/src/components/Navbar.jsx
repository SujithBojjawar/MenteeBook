import React from "react";
import "../styles/theme.css";

function Navbar({ mentor }) {
  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{
        backgroundColor: "var(--navbar-bg, #ffffff)",
        borderBottom: "2px solid var(--navbar-border, #38bdf8)",
        transition: "background 0.3s ease",
      }}
    >
      <div className="container-fluid px-4">
        {}
        <div className="d-flex align-items-center">
          <img
            src="/src/assets/klh.png" 
            alt="KL University Logo"
            style={{
              height: "46px",
              width: "60px",
              marginRight: "12px",
              borderRadius: "6px",
            }}
          />
          <span
            className="navbar-brand mb-0 h4 fw-bold app-title"
            style={{
              color: "var(--accent, #38bdf8)",
              letterSpacing: "0.3px",
            }}
          >
            Menteebook
          </span>
        </div>

        {}
        <div className="d-flex align-items-center gap-3">
          <div className="text-end me-2">
            <div className="fw-semibold username">
              {mentor?.name || "Mentor"}
            </div>
            <small
              className="text-secondary"
              style={{ fontSize: "0.85rem", letterSpacing: "0.2px" }}
            >
              Logged in
            </small>
          </div>

          <button
            id="themeToggleBtn"
            className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "38px",
              height: "38px",
              border: "1.5px solid var(--accent, #38bdf8)",
              color: "var(--accent, #38bdf8)",
              transition: "all 0.25s ease",
            }}
            onClick={() => {
              document.body.classList.toggle("dark-mode");
              document.body.classList.toggle("light-mode");
              localStorage.setItem(
                "theme",
                document.body.classList.contains("dark-mode")
                  ? "dark"
                  : "light"
              );
            }}
          >
            <i className="bi bi-moon-fill"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
