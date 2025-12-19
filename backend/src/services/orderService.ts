import Order from "../models/Order";
import { IOrderItem } from "../models/OrderItem";
import Inventory from "../models/Inventory";
import Commission from "../models/Commission";
import Seller from "../models/Seller";

/**
 * Process order status transition
 */
export const processOrderStatusTransition = async (
  orderId: string,
  newStatus: string,
  previousStatus: string
) => {
  const order = await Order.findById(orderId).populate("items");

  if (!order) {
    throw new Error("Order not found");
  }

  // Handle status-specific logic
  switch (newStatus) {
    case "Cancelled":
      // Restore inventory if order was confirmed
      if (["Processed", "Shipped"].includes(previousStatus)) {
        await restoreInventory(order.items as any[]);
      }
      break;

    case "Processed":
      // Reserve inventory
      await reserveInventory(order.items as any[]);
      break;

    case "Delivered":
      // Create commissions for sellers
      await createCommissions(order.items as any[]);
      break;
  }

  return order;
};

/**
 * Reserve inventory for order items
 */
const reserveInventory = async (items: IOrderItem[]) => {
  for (const item of items) {
    const inventory = await Inventory.findOne({ product: item.product });
    if (inventory) {
      inventory.reservedStock += item.quantity;
      inventory.availableStock = Math.max(
        0,
        inventory.currentStock - inventory.reservedStock
      );
      await inventory.save();
    }
  }
};

/**
 * Restore inventory when order is cancelled
 */
const restoreInventory = async (items: IOrderItem[]) => {
  for (const item of items) {
    const inventory = await Inventory.findOne({ product: item.product });
    if (inventory) {
      inventory.reservedStock = Math.max(
        0,
        inventory.reservedStock - item.quantity
      );
      inventory.availableStock =
        inventory.currentStock - inventory.reservedStock;
      await inventory.save();
    }
  }
};

/**
 * Create commissions for sellers when order is delivered
 */
const createCommissions = async (items: IOrderItem[]) => {
  for (const item of items) {
    const seller = await Seller.findById(item.seller);
    if (seller && seller.commission > 0) {
      const commissionRate = seller.commission;
      const commissionAmount = (item.total * commissionRate) / 100;

      await Commission.create({
        order: item.order,
        orderItem: item._id,
        seller: item.seller,
        orderAmount: item.total,
        commissionRate,
        commissionAmount,
        status: "Pending",
      });
    }
  }
};

/**
 * Validate order can transition to new status
 */
export const validateStatusTransition = (
  currentStatus: string,
  newStatus: string
): { valid: boolean; message?: string } => {
  const validTransitions: Record<string, string[]> = {
    Received: ["Pending", "Cancelled"],
    Pending: ["Processed", "Cancelled"],
    Processed: ["Shipped", "Cancelled"],
    Shipped: ["Out for Delivery", "Cancelled"],
    "Out for Delivery": ["Delivered", "Cancelled"],
    Delivered: ["Returned"],
    Cancelled: [],
    Returned: [],
  };

  const allowedStatuses = validTransitions[currentStatus] || [];

  if (!allowedStatuses.includes(newStatus)) {
    return {
      valid: false,
      message: `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${allowedStatuses.join(
        ", "
      )}`,
    };
  }

  return { valid: true };
};

/**
 * Calculate order totals
 */
export const calculateOrderTotals = async (
  items: IOrderItem[],
  couponCode?: string
) => {
  let subtotal = 0;
  let tax = 0;
  let shipping = 0;
  let discount = 0;

  // Calculate subtotal from items
  for (const item of items) {
    subtotal += item.total;
  }

  // Apply coupon discount if provided
  if (couponCode) {
    // Coupon validation and discount calculation would go here
    // For now, we'll skip this as it's handled in the coupon controller
  }

  // Calculate tax (example: 18% GST)
  tax = subtotal * 0.18;

  // Calculate shipping (example: free shipping over 500)
  if (subtotal < 500) {
    shipping = 50;
  }

  const total = subtotal + tax + shipping - discount;

  return {
    subtotal,
    tax,
    shipping,
    discount,
    total,
  };
};
