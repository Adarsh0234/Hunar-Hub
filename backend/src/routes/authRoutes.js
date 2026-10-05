import { registerUser, verifyOtp, loginUser } from "../controllers/authcontroller.js";
import express from "express";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);

export default router;