import express from "express";
import {
  getAllMentees,
  addMentee,
  deleteMentee,
  deleteAllMentees,
  addIssue,
  updateIssueStatus,
  addBulkMentees,
  generateMentorReport,
  generateMenteeReport,
} from "../controllers/mentorController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mentees", verifyToken, getAllMentees);
router.get("/generate-report/:menteeId", verifyToken, generateMenteeReport);
router.post("/add-mentee", verifyToken, addMentee);
router.delete("/delete-mentee/:menteeId", verifyToken, deleteMentee);
router.delete("/delete-all-mentees", verifyToken, deleteAllMentees);
router.post("/add-issue/:menteeId", verifyToken, addIssue);
router.put("/update-issue/:issueId", verifyToken, updateIssueStatus);
router.post("/add-bulk-mentees", verifyToken, addBulkMentees);
router.get("/generate-report", verifyToken, generateMentorReport);

export default router;
