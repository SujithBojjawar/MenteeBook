import express from "express";
import cors from "cors";
import { verifyToken, isAdmin } from "./middleware/authMiddleware.js";

// 🛠️ Import Routes
import authRoutes from "./routes/authRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import menteeRoutes from "./routes/menteeRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// 🌐 CORS Configuration - FIXED
const corsOptions = {
 origin: [
 "http://localhost:5173", // ✅ Local development
 "https://mentee-book.vercel.app" // ✅ Deployed frontend on Vercel
 ],
 methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // ✅ Added OPTIONS
 allowedHeaders: ["Content-Type", "Authorization"],
 credentials: true,
};

app.use(cors(corsOptions));

// ✅ Explicitly handle OPTIONS preflight requests
app.options("*", cors(corsOptions));

// 🧠 Middleware
app.use(express.json());

// 🏠 Health check route
app.get("/", (req, res) => {
 res.status(200).send("🚀 Mentor–Mentee Management API is running...");
});

// 🔐 Public routes (no auth required)
app.use("/api/v1/auth", authRoutes);

// 👨‍🏫 Mentor routes (protected inside route)
app.use("/api/v1/mentor", mentorRoutes);

// 👨‍🎓 Mentee routes (protected)
app.use("/api/v1/mentee", verifyToken, menteeRoutes);

// 🧾 Issue routes (protected)
app.use("/api/v1/issue", verifyToken, issueRoutes);

// 🧑‍💼 Admin routes (protected + admin-only)
app.use("/api/v1/admin", verifyToken, isAdmin, adminRoutes);

// ⚠️ 404 handler
app.use((req, res) => {
 res.status(404).json({ message: "Route not found" });
});

// 🚨 Global error handler (optional but good for debugging)
app.use((err, req, res, next) => {
 console.error("❌ Server Error:", err.stack);
 res.status(500).json({ message: "Internal Server Error", error: err.message });
});

export default app;
