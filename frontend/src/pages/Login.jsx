import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/theme.css";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setError("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await API.post("/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: "mentor",
        });
        alert("Signup successful! Please login now.");
        setIsSignUp(false);
      } else {
        const res = await API.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        const { token, user } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        if (user.role === "mentor") navigate("/mentor");
        else if (user.role === "admin") navigate("/admin");
        else navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Something went wrong. Try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -50,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
        background:
          "radial-gradient(circle at top left, #1e3a8a, #0f172a 50%, #020617 100%)",
      }}
    >
 
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "140%",
          height: "140%",
          background:
            "radial-gradient(circle at 30% 20%, rgba(255, 200, 80, 0.25), transparent 60%), radial-gradient(circle at 70% 80%, rgba(56, 189, 248, 0.25), transparent 60%)",
          zIndex: 0,
          filter: "blur(100px)",
          animation: "glowmove 8s ease-in-out infinite alternate",
        }}
      ></div>

      <style>
        {`
          @keyframes glowmove {
            0% { transform: translateY(0px) scale(1); }
            100% { transform: translateY(-20px) scale(1.05); }
          }
        `}
      </style>

      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", position: "relative", zIndex: 2 }}
      >
        <motion.div
          className="text-light rounded-4 shadow-lg p-4 p-md-5"
          style={{
            width: "100%",
            maxWidth: "480px",
            minHeight: "520px",
            backdropFilter: "blur(18px)",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.7))",
            border: "1px solid rgba(56,189,248,0.3)",
            boxShadow:
              "0 0 25px rgba(56,189,248,0.15), 0 0 55px rgba(255,215,0,0.05)",
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait">
            {!isSignUp ? (
              <motion.div
                key="login"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2
                  className="text-center fw-bold mb-4"
                  style={{
                    color: "#38bdf8",
                    textShadow: "0 0 10px rgba(56,189,248,0.5)",
                  }}
                >
                  Welcome Back 👋
                </h2>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-light-50">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-transparent text-light border-info"
                      placeholder="Enter your email"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light-50">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-transparent text-light border-info"
                      placeholder="Enter password"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 fw-semibold mt-3 py-2"
                    style={{
                      background:
                        "linear-gradient(90deg, #38bdf8, #2563eb, #38bdf8)",
                      border: "none",
                      color: "white",
                      boxShadow:
                        "0 0 15px rgba(56,189,248,0.5), 0 0 25px rgba(37,99,235,0.4)",
                      transition: "0.3s ease",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.boxShadow =
                        "0 0 25px rgba(56,189,248,0.8), 0 0 45px rgba(37,99,235,0.6)")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.boxShadow =
                        "0 0 15px rgba(56,189,248,0.5), 0 0 25px rgba(37,99,235,0.4)")
                    }
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                  <p className="text-center mt-3 text-secondary">
                    Don’t have an account?{" "}
                    <span
                      onClick={toggleForm}
                      className="fw-semibold"
                      style={{
                        color: "#38bdf8",
                        cursor: "pointer",
                        textShadow: "0 0 10px rgba(56,189,248,0.5)",
                      }}
                    >
                      Sign Up
                    </span>
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2
                  className="text-center fw-bold mb-4"
                  style={{
                    color: "#38bdf8",
                    textShadow: "0 0 10px rgba(56,189,248,0.5)",
                  }}
                >
                  Create Account 
                </h2>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-light-50">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control bg-transparent text-light border-info"
                      placeholder="Enter your name"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light-50">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-transparent text-light border-info"
                      placeholder="Enter your email"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light-50">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-transparent text-light border-info"
                      placeholder="Create password"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 fw-semibold mt-3 py-2"
                    style={{
                      background:
                        "linear-gradient(90deg, #38bdf8, #2563eb, #38bdf8)",
                      border: "none",
                      color: "white",
                      boxShadow:
                        "0 0 15px rgba(56,189,248,0.5), 0 0 25px rgba(37,99,235,0.4)",
                    }}
                    disabled={loading}
                  >
                    {loading ? "Signing up..." : "Sign Up"}
                  </button>
                  <p className="text-center mt-3 text-secondary">
                    Already have an account?{" "}
                    <span
                      onClick={toggleForm}
                      className="fw-semibold"
                      style={{
                        color: "#38bdf8",
                        cursor: "pointer",
                        textShadow: "0 0 10px rgba(56,189,248,0.5)",
                      }}
                    >
                      Login
                    </span>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
