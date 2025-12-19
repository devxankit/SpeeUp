import { Router } from "express";
import * as deliveryDashboardController from "../modules/delivery/controllers/deliveryDashboardController";
import * as deliveryOrderController from "../modules/delivery/controllers/deliveryOrderController";
import * as deliveryEarningController from "../modules/delivery/controllers/deliveryEarningController";
import { getProfile } from "../modules/delivery/controllers/deliveryAuthController";

const router = Router();

// Profile
router.get("/profile", getProfile);

// Dashboard Stats
router.get("/dashboard/stats", deliveryDashboardController.getDashboardStats);

// Help & Support
router.get("/help", deliveryDashboardController.getHelpSupport);

// Orders
router.get("/orders/today", deliveryOrderController.getTodayOrders);
router.get("/orders/pending", deliveryOrderController.getPendingOrders);
router.get("/orders/:id", deliveryOrderController.getOrderDetails); // Specific order details
router.put("/orders/:id/status", deliveryOrderController.updateOrderStatus);

// Earnings
router.get("/earnings", deliveryEarningController.getEarningsHistory);

export default router;
