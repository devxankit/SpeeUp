import { Router } from "express";
import adminAuthRoutes from "./adminAuthRoutes";
import sellerAuthRoutes from "./sellerAuthRoutes";
import dashboardRoutes from "./dashboardRoutes";
import customerAuthRoutes from "./customerAuthRoutes";
import deliveryRoutes from "./deliveryRoutes";
import deliveryAuthRoutes from "./deliveryAuthRoutes";

// ... (other imports)
import { authenticate, requireUserType } from "../middleware/auth";
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
import customerProductRoutes from "./customerProductRoutes";
import customerOrderRoutes from "./customerOrderRoutes";
import customerCategoryRoutes from "./customerCategoryRoutes";
import customerCouponRoutes from "./customerCouponRoutes";
import customerAddressRoutes from "./customerAddressRoutes";
import customerHomeRoutes from "./customerHomeRoutes";
import customerWalletRoutes from "./customerWalletRoutes";
import customerCartRoutes from "./customerCartRoutes";
import wishlistRoutes from "./wishlistRoutes";
import productReviewRoutes from "./productReviewRoutes";
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

// Delivery routes (protected)
router.use("/delivery", authenticate, requireUserType("Delivery"), deliveryRoutes);

// Customer routes (protected)
router.use("/customer", customerRoutes);
router.use("/customer/products", customerProductRoutes);
router.use("/customer/categories", customerCategoryRoutes);
router.use("/customer/orders", customerOrderRoutes);
router.use("/customer/coupons", customerCouponRoutes);
router.use("/customer/addresses", customerAddressRoutes);
router.use("/customer/home", customerHomeRoutes);
router.use("/customer/cart", customerCartRoutes);
router.use("/customer/wallet", customerWalletRoutes);
router.use("/customer/wishlist", wishlistRoutes);
router.use("/customer/reviews", productReviewRoutes);

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
