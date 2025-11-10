# 📘 MenteeBook – Mentor & Mentee Tracking System

**Tech Stack:** React.js, Bootstrap 5, Node.js, Express.js, MongoDB, JWT  

MenteeBook is a full-stack web application designed for **faculty mentors** to efficiently manage their mentees, record follow-ups, track progress, and generate individual or collective reports — all from one unified dashboard.

---

## 🚀 Features

- **👩‍🏫 Mentor Dashboard**
  - View, search, and manage all mentees in one place.
  - Track mentee progress with real-time status updates (✅ Solved / ⚠️ Pending).

- **🔐 Secure Authentication**
  - Implemented using **JWT (JSON Web Token)**.
  - Backend routes are protected with middleware-based authorization.

- **📦 Bulk CSV Upload**
  - Upload 50–100 mentees in a single upload.
  - Automatically validates data and prevents duplicates.

- **📄 Individual Mentee Reports**
  - Generate and download **PDF reports** for each mentee.
  - Includes follow-up history and performance summary.

- **🧾 All Mentees Report (Global Report)**
  - Generate a **single consolidated PDF report** for *all mentees* under a mentor.
  - Automatically includes mentee details and their issue summaries.
  - Useful for faculty review meetings or semester documentation.

- **🔎 Smart Search & Status Filters**
  - Instantly search mentees by name or roll number.
  - Highlight mentees with pending issues for quick review.

- **🧩 Follow-Up Management**
  - Add new follow-ups and mark issues as solved with one click.
  - Real-time UI updates across both the table and details modal.

---

## 🏗️ Tech Stack Overview

| Layer | Technologies Used |
|-------|--------------------|
| **Frontend** | React.js, Bootstrap 5, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose ODM |
| **Authentication** | JWT (JSON Web Token) |
| **File Handling** | CSV Upload (via Papaparse / Express) |
| **Reports** | PDFKit for individual and all-mentee PDF generation |

---

