import { Router } from "express";
import { createOrder, getMyOrders, getOrderById } from "../modules/customer/controllers/customerOrderController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Protected routes (must be logged in)
router.use(authenticate);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

export default router;
