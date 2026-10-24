import { registerUser, verifyOtp, resendOtp, loginUser } from "../controllers/authcontroller.js";
import express from "express";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);

export default router;