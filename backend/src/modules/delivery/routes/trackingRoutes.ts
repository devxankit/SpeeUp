import express from 'express';
import { authenticate } from '../../../middleware/auth';
import { updateDeliveryLocation, getActiveOrdersTracking } from '../../customer/controllers/trackingController';

const router = express.Router();

// Delivery partner tracking routes
router.post('/location', authenticate, updateDeliveryLocation);
router.get('/active-orders', authenticate, getActiveOrdersTracking);

export default router;
