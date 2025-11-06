import express from "express";
import cors from "cors";

import { verifyToken, isAdmin } from "./middleware/authMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import menteeRoutes from "./routes/menteeRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

import cors from "cors";

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://menteebook.vercel.app" 
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Mentor–Mentee Management API is running...");
});

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/mentor", mentorRoutes);

app.use("/api/v1/mentee", verifyToken, menteeRoutes);

app.use("/api/v1/issue", verifyToken, issueRoutes);

app.use("/api/v1/admin", verifyToken, isAdmin, adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
