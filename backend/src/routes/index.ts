import { Router } from "express";
import adminAuthRoutes from "./adminAuthRoutes";
import sellerAuthRoutes from "./sellerAuthRoutes";
import dashboardRoutes from "./dashboardRoutes";
import customerAuthRoutes from "./customerAuthRoutes";
import deliveryAuthRoutes from "./deliveryAuthRoutes";
import customerRoutes from "./customerRoutes";
import sellerRoutes from "./sellerRoutes";
import uploadRoutes from "./uploadRoutes";
import productRoutes from "./productRoutes";
import categoryRoutes from "./categoryRoutes";
import orderRoutes from "./orderRoutes";
import returnRoutes from "./returnRoutes";
import reportRoutes from "./reportRoutes";
import walletRoutes from "./walletRoutes";
import taxRoutes from "./taxRoutes";
import adminRoutes from "./adminRoutes";

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

// Seller dashboard routes
router.use("/seller/dashboard", dashboardRoutes);

// Seller management routes (protected, admin only)
router.use("/sellers", sellerRoutes);

// Admin routes (protected, admin only)
router.use("/admin", adminRoutes);

// Upload routes (protected)
router.use("/upload", uploadRoutes);

// Product routes (protected, seller only)
router.use("/products", productRoutes);

// Category routes (protected, seller/admin)
router.use("/categories", categoryRoutes);

// Order routes (protected, seller only)
router.use("/orders", orderRoutes);

// Return routes (protected, seller only)
router.use("/returns", returnRoutes);

// Report routes (protected, seller only)
router.use("/seller/reports", reportRoutes);

// Wallet routes (protected, seller only)
router.use("/seller/wallet", walletRoutes);

// Tax routes (protected, seller/admin)
router.use("/seller/taxes", taxRoutes);

// Add more routes here
// router.use('/users', userRoutes);

export default router;
