import { Router } from 'express';
import adminAuthRoutes from './auth/adminAuthRoutes';
import sellerAuthRoutes from './auth/sellerAuthRoutes';
import customerAuthRoutes from './auth/customerAuthRoutes';
import deliveryAuthRoutes from './auth/deliveryAuthRoutes';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
router.use('/auth/admin', adminAuthRoutes);
router.use('/auth/seller', sellerAuthRoutes);
router.use('/auth/customer', customerAuthRoutes);
router.use('/auth/delivery', deliveryAuthRoutes);

// Add more routes here
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);

export default router;


