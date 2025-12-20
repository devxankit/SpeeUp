import { Router } from "express";
import { authenticate, requireUserType } from "../middleware/auth";

// Dashboard Controllers
import * as dashboardController from "../modules/admin/controllers/adminDashboardController";

// Product Controllers
import * as productController from "../modules/admin/controllers/adminProductController";

// Order Controllers
import * as orderController from "../modules/admin/controllers/adminOrderController";

// Customer Controllers
import * as customerController from "../modules/admin/controllers/adminCustomerController";

// Delivery Controllers
import * as deliveryController from "../modules/admin/controllers/adminDeliveryController";

// Settings Controllers
import * as settingsController from "../modules/admin/controllers/adminSettingsController";

// Coupon Controllers
import * as couponController from "../modules/admin/controllers/adminCouponController";

// Notification Controllers
import * as notificationController from "../modules/admin/controllers/adminNotificationController";

// Wallet Controllers
import * as walletController from "../modules/admin/controllers/adminWalletController";

// Tax Controllers
import * as taxController from "../modules/admin/controllers/adminTaxController";

// Cash Collection Controllers
import * as cashCollectionController from "../modules/admin/controllers/adminCashCollectionController";

// FAQ Controllers
import * as faqController from "../modules/admin/controllers/adminFAQController";

// Role Controllers
import * as roleController from "../modules/admin/controllers/adminRoleController";

import * as paymentController from "../modules/admin/controllers/adminPaymentController";
import * as policyController from "../modules/admin/controllers/adminPolicyController";
import * as sellerController from "../modules/admin/controllers/adminSellerController";

// Profile Controllers
import * as profileController from "../modules/admin/controllers/adminProfileController";

// Shop Controllers (Shop by Store)
import {
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
} from "../modules/admin/controllers/adminShopController";

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireUserType("Admin"));

// ==================== Profile Routes ====================
router.get("/profile", profileController.getProfile);
router.put("/profile", profileController.updateProfile);

// ==================== Dashboard Routes ====================
router.get("/dashboard/stats", dashboardController.getDashboardStatsController);
router.get(
  "/dashboard/analytics",
  dashboardController.getSalesAnalyticsController
);
router.get(
  "/dashboard/top-sellers",
  dashboardController.getTopSellersController
);
router.get(
  "/dashboard/recent-orders",
  dashboardController.getRecentOrdersController
);
router.get(
  "/dashboard/sales-by-location",
  dashboardController.getSalesByLocationController
);

// ==================== Category Routes ====================
router.post("/categories", productController.createCategory);
router.get("/categories", productController.getCategories);
router.put("/categories/:id", productController.updateCategory);
router.delete("/categories/:id", productController.deleteCategory);
router.put("/categories/order", productController.updateCategoryOrder);

// ==================== SubCategory Routes ====================
router.post("/subcategories", productController.createSubCategory);
router.get("/subcategories", productController.getSubCategories);
router.put("/subcategories/:id", productController.updateSubCategory);
router.delete("/subcategories/:id", productController.deleteSubCategory);

// ==================== Brand Routes ====================
router.post("/brands", productController.createBrand);
router.get("/brands", productController.getBrands);
router.put("/brands/:id", productController.updateBrand);
router.delete("/brands/:id", productController.deleteBrand);

// ==================== Product Routes ====================
router.post("/products", productController.createProduct);
router.get("/products", productController.getProducts);
router.put("/products/order", productController.updateProductOrder);
router.get("/products/:id", productController.getProductById);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);
router.patch("/products/:id/approve", productController.approveProductRequest);
router.post("/products/bulk-import", productController.bulkImportProducts);
router.put("/products/bulk-update", productController.bulkUpdateProducts);

// ==================== Order Routes ====================
router.get("/orders", orderController.getAllOrders);
router.get("/orders/status/:status", orderController.getOrdersByStatus);
router.get("/orders/:id", orderController.getOrderById);
router.patch("/orders/:id/status", orderController.updateOrderStatus);
router.patch("/orders/:id/assign-delivery", orderController.assignDeliveryBoy);
router.get("/orders/export/csv", orderController.exportOrders);

// ==================== Return Request Routes ====================
router.get("/return-requests", orderController.getReturnRequests);
router.get("/return-requests/:id", orderController.getReturnRequestById);
router.put("/return-requests/:id", orderController.processReturnRequest);
// Legacy route support if needed, but frontend uses /return-requests
router.patch("/returns/:id/process", orderController.processReturnRequest);

// ==================== Customer Routes ====================
router.get("/customers", customerController.getAllCustomers);
router.get("/customers/:id", customerController.getCustomerById);
router.patch("/customers/:id/status", customerController.updateCustomerStatus);
router.get("/customers/:id/orders", customerController.getCustomerOrders);
router.patch("/customers/:id/wallet", customerController.updateCustomerWallet);

// ==================== Delivery Routes ====================
router.post("/delivery", deliveryController.createDeliveryBoy);
router.get("/delivery", deliveryController.getAllDeliveryBoys);
router.get("/delivery/:id", deliveryController.getDeliveryBoyById);
router.put("/delivery/:id", deliveryController.updateDeliveryBoy);
router.patch("/delivery/:id/status", deliveryController.updateDeliveryStatus);
router.patch("/delivery/:id/availability", deliveryController.updateDeliveryBoyAvailability);
router.delete("/delivery/:id", deliveryController.deleteDeliveryBoy);
router.get(
  "/delivery/:id/assignments",
  deliveryController.getDeliveryAssignments
);
router.post("/delivery/:id/collect-cash", deliveryController.collectCash);
router.get("/delivery/:id/cash-collections", deliveryController.getDeliveryBoyCashCollections);

// ==================== Payment Routes ====================
router.get("/payment-methods", paymentController.getPaymentMethods);
router.get("/payment-methods/:id", paymentController.getPaymentMethodById);
router.put("/payment-methods/:id", paymentController.updatePaymentMethod);
router.patch("/payment-methods/:id/status", paymentController.updatePaymentMethodStatus);

// ==================== Settings Routes ====================
router.get("/settings", settingsController.getAppSettings);
router.put("/settings", settingsController.updateAppSettings);
router.get("/settings/payment-methods", settingsController.getPaymentMethods);
router.put(
  "/settings/payment-methods",
  settingsController.updatePaymentMethods
);
router.get("/settings/sms-gateway", settingsController.getSMSGatewaySettings);
router.put(
  "/settings/sms-gateway",
  settingsController.updateSMSGatewaySettings
);

// ==================== Coupon Routes ====================
router.post("/coupons", couponController.createCoupon);
router.get("/coupons", couponController.getCoupons);
router.get("/coupons/:id", couponController.getCouponById);
router.put("/coupons/:id", couponController.updateCoupon);
router.delete("/coupons/:id", couponController.deleteCoupon);
router.post("/coupons/validate", couponController.validateCoupon);

// ==================== Notification Routes ====================
router.post("/notifications", notificationController.createNotification);
router.get("/notifications", notificationController.getNotifications);
router.get("/notifications/:id", notificationController.getNotificationById);
router.put("/notifications/:id", notificationController.updateNotification);
router.delete("/notifications/:id", notificationController.deleteNotification);
router.post("/notifications/:id/send", notificationController.sendNotification);
router.patch("/notifications/:id/read", notificationController.markAsRead);
router.patch("/notifications/read-all", notificationController.markMultipleAsRead);
router.patch("/notifications/mark-read", notificationController.markMultipleAsRead); // Legacy support

// ==================== Wallet Routes ====================
router.get("/wallet/transactions", walletController.getWalletTransactions);
router.post("/wallet/transfer", walletController.processFundTransfer);
router.get("/wallet/seller/:sellerId", walletController.getSellerTransactions);
router.post("/wallet/withdrawal", walletController.processWithdrawal);

// ==================== Tax Routes ====================
router.get("/taxes", taxController.getTaxes);
router.get("/taxes/:id", taxController.getTaxById);
router.post("/taxes", taxController.createTax);
router.put("/taxes/:id", taxController.updateTax);
router.patch("/taxes/:id/status", taxController.updateTaxStatus);
router.delete("/taxes/:id", taxController.deleteTax);

// ==================== Cash Collection Routes ====================
router.get("/cash-collections", cashCollectionController.getCashCollections);
router.get("/cash-collections/:id", cashCollectionController.getCashCollectionById);
router.post("/cash-collections", cashCollectionController.createCashCollection);
router.put("/cash-collections/:id", cashCollectionController.updateCashCollection);
router.delete("/cash-collections/:id", cashCollectionController.deleteCashCollection);

// ==================== FAQ Routes ====================
router.get("/faqs", faqController.getFAQs);
router.get("/faqs/:id", faqController.getFAQById);
router.post("/faqs", faqController.createFAQ);
router.put("/faqs/:id", faqController.updateFAQ);
router.patch("/faqs/:id/status", faqController.updateFAQStatus);
router.delete("/faqs/:id", faqController.deleteFAQ);
router.put("/faqs/order", faqController.updateFAQOrder);

// ==================== Role Routes ====================
// Note: /permissions must come before /:id to avoid collision
router.get("/roles/permissions", roleController.getPermissions);
router.get("/roles", roleController.getRoles);
router.get("/roles/:id", roleController.getRoleById);
router.post("/roles", roleController.createRole);
router.put("/roles/:id", roleController.updateRole);
router.delete("/roles/:id", roleController.deleteRole);

// ==================== Policy Routes ====================
router.post("/policies", policyController.createPolicy);
router.get("/policies", policyController.getPolicies);
router.put("/policies/:id", policyController.updatePolicy);
router.delete("/policies/:id", policyController.deletePolicy);

// ==================== Seller Routes ====================
router.get("/sellers", sellerController.getAllSellers);

// ==================== Shop Management ====================


router.post("/shop/create", createShop);
router.get("/shops", getAllShops);
router.get("/shop/:id", getShopById);
router.put("/shop/:id", updateShop);
router.delete("/shop/:id", deleteShop);

export default router;
