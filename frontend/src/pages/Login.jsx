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
    hidden: { opacity: 0, scale: 0.9, x: isSignUp ? 150 : -150 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      x: isSignUp ? -150 : 150,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "#0D0D0D",
        minHeight: "100vh",
        width: "100vw",
      }}
    >
      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <motion.div
          className="bg-dark text-light rounded-4 shadow-lg p-4 p-md-5"
          style={{
            width: "100%",
            maxWidth: "500px",
            minHeight: "520px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 35px rgba(255,123,0,0.15)",
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
                <h2 className="text-center text-warning fw-bold mb-4">
                  Welcome Back 👋
                </h2>

                {error && (
                  <div className="alert alert-danger py-2">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-white-50">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-transparent text-light border-light"
                      placeholder="Enter your email"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-transparent text-light border-light"
                      placeholder="Enter password"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-warning w-100 fw-semibold mt-3 py-2"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                  <p className="text-center mt-3 text-white-50">
                    Don’t have an account?{" "}
                    <span
                      onClick={toggleForm}
                      className="text-warning fw-semibold"
                      style={{ cursor: "pointer" }}
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
                <h2 className="text-center text-warning fw-bold mb-4">
                  Create Account 🧡
                </h2>

                {error && (
                  <div className="alert alert-danger py-2">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-white-50">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control bg-transparent text-light border-light"
                      placeholder="Enter your name"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50">Email address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-transparent text-light border-light"
                      placeholder="Enter your email"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-transparent text-light border-light"
                      placeholder="Create password"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-warning w-100 fw-semibold mt-3 py-2"
                    disabled={loading}
                  >
                    {loading ? "Signing up..." : "Sign Up"}
                  </button>
                  <p className="text-center mt-3 text-white-50">
                    Already have an account?{" "}
                    <span
                      onClick={toggleForm}
                      className="text-warning fw-semibold"
                      style={{ cursor: "pointer" }}
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
