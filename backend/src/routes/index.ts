import { Router } from 'express';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Add more routes here
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);

export default router;

