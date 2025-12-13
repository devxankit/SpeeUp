import { Router } from 'express';
import * as customerController from '../controllers/customerController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get customer profile (protected route)
router.get('/profile', authenticate, customerController.getProfile);

// Update customer profile (protected route)
router.put('/profile', authenticate, customerController.updateProfile);

export default router;

