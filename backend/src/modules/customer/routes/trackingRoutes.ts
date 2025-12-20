import express from 'express';
import { authenticate } from '../../../middleware/auth';
import { getOrderTracking } from '../controllers/trackingController';

const router = express.Router();

// Customer tracking routes
router.get('/orders/:orderId/tracking', authenticate, getOrderTracking);

export default router;
