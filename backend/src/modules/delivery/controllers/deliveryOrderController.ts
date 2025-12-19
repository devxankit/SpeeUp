import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import Order from "../../../models/Order";
import Delivery from "../../../models/Delivery";
// import mongoose from "mongoose";

/**
 * Helper to map order items for response
 */
const mapOrderItems = (items: any[]) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item: any) => ({
        name: item.productName || "Unknown Item",
        quantity: item.quantity || 0,
        price: item.total || 0, // Using total price for the line item
        image: item.productImage
    }));
};
// import mongoose from "mongoose";

/**
 * Get All Orders History
 * Returns all past orders with pagination
 */
export const getAllOrdersHistory = asyncHandler(async (req: Request, res: Response) => {
    const deliveryId = (req.user as any)?.userId || (req.user as any)?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ deliveryBoy: deliveryId })
        .populate("items") // Populate OrderItems
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments({ deliveryBoy: deliveryId });

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
        id: order._id,
        orderId: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status,
        address: `${order.deliveryAddress.address}, ${order.deliveryAddress.city}`,
        totalAmount: order.total,
        items: mapOrderItems(order.items),
        createdAt: order.createdAt,
        estimatedDeliveryTime: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'
    }));

    res.status(200).json({
        success: true,
        data: formattedOrders,
        pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
        }
    });
});

/**
 * Get Today's Assigned Orders
 */
export const getTodayOrders = asyncHandler(async (req: Request, res: Response) => {
    const deliveryId = (req.user as any)?.userId;
    const deliveryId = req.user?.userId;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const orders = await Order.find({
        deliveryBoy: deliveryId,
        $or: [
            { createdAt: { $gte: todayStart, $lte: todayEnd } }, // Created today
            { updatedAt: { $gte: todayStart, $lte: todayEnd } }  // OR Updated today
        ]
    })
        .populate("items")
        .sort({ updatedAt: -1 });

    const formattedOrders = orders.map(order => ({
        id: order._id,
        orderId: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status,
        address: `${order.deliveryAddress?.address || ''}, ${order.deliveryAddress?.city || ''}`,
        items: mapOrderItems(order.items), // Real items
        totalAmount: order.total,
        estimatedDeliveryTime: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        createdAt: order.createdAt,
        // Distance calculation to be implemented. sending null/undefined for now to avoid fake data
        distance: null
    }));

    return res.status(200).json({
        success: true,
        data: formattedOrders
    });
});

/**
 * Get Pending Orders
 */
export const getPendingOrders = asyncHandler(async (req: Request, res: Response) => {
    const deliveryId = (req.user as any)?.userId;
    const deliveryId = req.user?.userId;

    // Pending statuses: Ready for pickup, Out for delivery, Picked Up, Assigned, In Transit
    const orders = await Order.find({
        deliveryBoy: deliveryId,
        status: { $in: ["Ready for pickup", "Out for Delivery", "Picked Up", "Assigned", "In Transit"] }
    })
        .populate("items")
        .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
        id: order._id,
        orderId: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status,
        address: `${order.deliveryAddress?.address || ''}, ${order.deliveryAddress?.city || ''}`,
        items: mapOrderItems(order.items), // Real items
        totalAmount: order.total,
        estimatedDeliveryTime: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        createdAt: order.createdAt,
        distance: null
    }));

    return res.status(200).json({
        success: true,
        data: formattedOrders
    });
});

/**
 * Get Specific Order Details
 */
export const getOrderDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const order = await Order.findById(id).populate("items");

    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    const formattedOrder = {
        id: order._id,
        orderId: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        address: `${order.deliveryAddress?.address || ''}, ${order.deliveryAddress?.city || ''}`,
        status: order.status,
        items: mapOrderItems(order.items), // Real populated items
        totalAmount: order.total,
        createdAt: order.createdAt,
        distance: null
    };

    return res.status(200).json({
        success: true,
        data: formattedOrder
    });
});

/**
 * Update Order Status
 */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const deliveryId = (req.user as any)?.userId;
    const deliveryId = req.user?.userId;

    const order = await Order.findById(id);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.deliveryBoy?.toString() != deliveryId) {
        return res.status(403).json({ success: false, message: "This order is not assigned to you" });
    }

    // const oldStatus = order.status;
    order.status = status;
    // Status transition logic
    if (status) order.status = status;

    if (status === 'Picked up' || status === 'Out for Delivery') {
        order.deliveryBoyStatus = 'Picked Up';
    } else if (status === 'Delivered') {
        order.deliveryBoyStatus = 'Delivered';
        order.deliveredAt = new Date();
        order.paymentStatus = 'Paid'; // Assume paid on delivery (or already paid)

        // CASH COLLECTION LOGIC
        if (order.paymentMethod === 'COD') {
            await Delivery.findByIdAndUpdate(deliveryId, {
                $inc: { cashCollected: order.total }
            });
        }

        // COMMISSION LOGIC (Fixed mock amount for now, should be dynamic in future)
        const COMMISSION = 40;
        await Delivery.findByIdAndUpdate(deliveryId, {
            $inc: { balance: COMMISSION }
        });
    }

    await order.save();

    return res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: order
    });
});

/**
 * Get Return Orders
 */
export const getReturnOrders = asyncHandler(async (req: Request, res: Response) => {
    const deliveryId = (req.user as any)?.userId || (req.user as any)?.id;

    const orders = await Order.find({
        deliveryBoy: deliveryId,
        status: { $in: ["Returned", "Cancelled"] }
    })
        .populate("items")
        .sort({ updatedAt: -1 });

    const formattedOrders = orders.map(order => ({
        id: order._id,
        orderId: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status,
        address: `${order.deliveryAddress?.address || ''}, ${order.deliveryAddress?.city || ''}`,
        items: mapOrderItems(order.items),
        totalAmount: order.total,
        createdAt: order.createdAt,
        distance: null
    }));

    return res.status(200).json({
        success: true,
        data: formattedOrders
    });
});
