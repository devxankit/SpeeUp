import { Router } from 'express';
import * as customerAuthController from '../../controllers/auth/customerAuthController';
import { otpRateLimiter, loginRateLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Send OTP route
router.post('/send-otp', otpRateLimiter, customerAuthController.sendOTP);

// Verify OTP and login route
router.post('/verify-otp', loginRateLimiter, customerAuthController.verifyOTP);

// Register route
router.post('/register', customerAuthController.register);

export default router;

