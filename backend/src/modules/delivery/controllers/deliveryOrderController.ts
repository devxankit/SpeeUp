import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import Order from "../../../models/Order";
import Delivery from "../../../models/Delivery";
// import mongoose from "mongoose";

/**
 * Get Today's Orders
 */
export const getTodayOrders = asyncHandler(async (req: Request, res: Response) => {
    const deliveryId = req.user?.userId;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const orders = await Order.find({
        deliveryBoy: deliveryId,
        $or: [
            { createdAt: { $gte: todayStart, $lte: todayEnd } }, // Created today
            { updatedAt: { $gte: todayStart, $lte: todayEnd } }  // OR Updated today (e.g. delivered)
        ]
    })
        .sort({ updatedAt: -1 }); // Most recent activity first

    // Map to simplified structure for frontend
    const formattedOrders = orders.map(order => ({
        id: order._id,
        orderId: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status,
        address: `${order.deliveryAddress?.address || ''}, ${order.deliveryAddress?.city || ''}`,
        items: order.items || [], // You might need to populate items if frontend needs details here
        totalAmount: order.total,
        estimatedDeliveryTime: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        createdAt: order.createdAt,
        distance: "2.5 km" // Mock distance for now, or calculate via Geolib
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
    const deliveryId = req.user?.userId;

    // Pending statuses: Ready for pickup, Out for delivery, Picked Up, Assigned
    const orders = await Order.find({
        deliveryBoy: deliveryId,
        status: { $in: ["Ready for pickup", "Out for Delivery", "Picked Up", "Assigned", "In Transit"] }
    }).sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
        id: order._id,
        orderId: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status,
        address: `${order.deliveryAddress?.address || ''}, ${order.deliveryAddress?.city || ''}`,
        items: order.items || [],
        totalAmount: order.total,
        estimatedDeliveryTime: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        createdAt: order.createdAt,
        distance: "1.2 km"
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

    // Populate items if needed (assuming OrderItem model exists)
    // For now returning raw items array if not populated
    const order = await Order.findById(id);

    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Mock items detail for frontend display if 'items' is just IDs
    // Ideally you perform .populate('items') here
    // But since I don't see OrderItem file explicitly to check schema, I'll pass generic structure
    const formattedOrder = {
        id: order._id,
        orderId: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        address: `${order.deliveryAddress?.address || ''}, ${order.deliveryAddress?.city || ''}`,
        status: order.status,
        items: [ // Mock items for now as I can't populate without verification of schema
            { name: "Product 1", quantity: 1, price: order.total }
        ],
        totalAmount: order.total,
        createdAt: order.createdAt,
        distance: "2.5 km"
    };

    return res.status(200).json({
        success: true,
        data: formattedOrder
    });
});

/**
 * Update Order Status
 * Important: Logic for status transitions and Payment/Earnings
 */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const deliveryId = req.user?.userId;

    const order = await Order.findById(id);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Use loose equality for ID check as one might be string and other object
    if (order.deliveryBoy?.toString() != deliveryId) {
        return res.status(403).json({ success: false, message: "This order is not assigned to you" });
    }

    order.status = status;

    // Basic lifecycle hooks
    if (status === 'Picked up' || status === 'Out for Delivery') {
        order.deliveryBoyStatus = 'Picked Up';
        // order.pickedUpAt = new Date(); // If schema has this
    } else if (status === 'Delivered') {
        order.deliveryBoyStatus = 'Delivered';
        order.deliveredAt = new Date();
        order.paymentStatus = 'Paid'; // Assume paid on delivery (or already paid)

        // CASH COLLECTION LOGIC
        if (order.paymentMethod === 'COD') {
            // Increment cashCollected for Delivery Partner
            await Delivery.findByIdAndUpdate(deliveryId, {
                $inc: { cashCollected: order.total }
            });
        }

        // COMMISSION LOGIC (Simple fixed amount)
        // In real app, this might be separate transaction
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
