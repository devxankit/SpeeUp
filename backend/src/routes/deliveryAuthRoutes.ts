import { Router } from "express";
import * as deliveryAuthController from "../modules/delivery/controllers/deliveryAuthController";
import { otpRateLimiter, loginRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Send OTP route
router.post("/send-otp", otpRateLimiter, deliveryAuthController.sendOTP);

// Verify OTP and login route
router.post("/verify-otp", loginRateLimiter, deliveryAuthController.verifyOTP);

// Register route
router.post("/register", deliveryAuthController.register);

export default router;
