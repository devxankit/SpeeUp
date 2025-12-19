import { Router } from "express";
import * as customerAuthController from "../modules/customer/controllers/customerAuthController";
import { otpRateLimiter, loginRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Send Call OTP route
// Changed from /send-otp to /send-call-otp as requested, or keep consistent?
// User said: "do APIs banao: (1) send-call-otp ... (2) verify-call-otp"
router.post("/send-call-otp", otpRateLimiter, customerAuthController.sendCallOtp);

// Verify Call OTP and login route
router.post("/verify-call-otp", loginRateLimiter, customerAuthController.verifyCallOtp);

// Register route
router.post("/register", customerAuthController.register);

export default router;
