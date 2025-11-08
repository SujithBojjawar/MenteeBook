import express from "express";
import {
  getAllMentees,
  addMentee,
  deleteMentee,
  deleteAllMentees,
  addIssue,
  updateIssueStatus,
  addBulkMentees,
} from "../controllers/mentorController.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/mentees", verifyToken, getAllMentees);
router.post("/add-mentee", verifyToken, addMentee);
router.delete("/delete-mentee/:menteeId", verifyToken, deleteMentee);
router.delete("/delete-all-mentees", verifyToken, deleteAllMentees);
router.post("/add-issue/:menteeId", verifyToken, addIssue);
router.put("/update-issue/:issueId", verifyToken, updateIssueStatus);
router.post("/add-bulk-mentees", verifyToken, addBulkMentees);
export default router;
