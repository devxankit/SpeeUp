import { Router } from "express";
import * as sellerAuthController from "../controllers/sellerAuthController";
import {
  otpRateLimiter,
  loginRateLimiter,
} from "../../../middleware/rateLimiter";

const router = Router();

// Send OTP route
router.post("/send-otp", otpRateLimiter, sellerAuthController.sendOTP);

// Verify OTP and login route
router.post("/verify-otp", loginRateLimiter, sellerAuthController.verifyOTP);

// Register route
router.post("/register", sellerAuthController.register);

export default router;
