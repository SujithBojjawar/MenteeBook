import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import MentorDashboard from "./pages/MentorDashboard";
import NotFound from "./pages/NotFound";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/theme.css";
import "./index.css";


const ProtectedRoute = ({ element: Component }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Component />;
};

function App() {

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.classList.add(`${savedTheme}-mode`);
  }, []);

  return (
    <Router>
      <Routes>
        {}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {}
        <Route path="/login" element={<Login />} />

        {}
        <Route
          path="/mentor"
          element={<ProtectedRoute element={MentorDashboard} />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
