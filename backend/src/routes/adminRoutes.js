import express from "express";
import {
  getAllMentors,
  getAllMentees,
  getDashboardStats,
} from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/mentors", getAllMentors);
router.get("/mentees", getAllMentees);
router.get("/stats", getDashboardStats);

export default router;
