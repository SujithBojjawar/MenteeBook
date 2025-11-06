import express from "express";
import { registerMentor, loginUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerMentor);

router.post("/login", loginUser);

export default router;
