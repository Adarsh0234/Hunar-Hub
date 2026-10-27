import { registerUser, verifyOtp, resendOtp, loginUser } from "../controllers/authcontroller.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimiter.js";
import express from "express";

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/login", authLimiter, loginUser);

export default router;