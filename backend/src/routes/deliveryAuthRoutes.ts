import { Router } from "express";
import * as deliveryAuthController from "../modules/delivery/controllers/deliveryAuthController";
import { otpRateLimiter, loginRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Send Call OTP route
router.post("/send-call-otp", otpRateLimiter, deliveryAuthController.sendCallOtp);

// Verify Call OTP and login route
router.post("/verify-call-otp", loginRateLimiter, deliveryAuthController.verifyCallOtp);

// Register route
router.post("/register", deliveryAuthController.register);

export default router;
