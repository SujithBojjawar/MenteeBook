import express from "express";
import { getAllIssues, deleteIssue } from "../controllers/issueController.js";

const router = express.Router();

router.get("/", getAllIssues); 
router.delete("/:issueId", deleteIssue); 

export default router;
