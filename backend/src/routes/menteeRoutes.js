import express from "express";
import {
  getMenteeById,
  getAllIssues,
  deleteIssue,
} from "../controllers/menteeController.js";

const router = express.Router();

router.get("/:menteeId", getMenteeById);

router.get("/:menteeId/issues", getAllIssues);

router.delete("/:menteeId/delete-issue/:issueId", deleteIssue);

export default router;
