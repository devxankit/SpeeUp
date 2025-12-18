import { Router } from "express";
import adminAuthRoutes from "./adminAuthRoutes";
import sellerAuthRoutes from "./sellerAuthRoutes";
import customerAuthRoutes from "./customerAuthRoutes";
import deliveryAuthRoutes from "./deliveryAuthRoutes";
import customerRoutes from "./customerRoutes";
import sellerRoutes from "./sellerRoutes";

const router = Router();

// Health check route
router.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
router.use("/auth/admin", adminAuthRoutes);
router.use("/auth/seller", sellerAuthRoutes);
router.use("/auth/customer", customerAuthRoutes);
router.use("/auth/delivery", deliveryAuthRoutes);

// Customer routes (protected)
router.use("/customer", customerRoutes);

// Seller management routes (protected, admin only)
router.use("/sellers", sellerRoutes);

// Add more routes here
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);

export default router;
