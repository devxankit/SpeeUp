import { Request, Response } from "express";
import Order from "../../../models/Order";
import OrderItem from "../../../models/OrderItem";
import { asyncHandler } from "../../../utils/asyncHandler";
import Seller from "../../../models/Seller";
import WalletTransaction from "../../../models/WalletTransaction";

/**
 * Get seller's orders with filters, sorting, and pagination
 */
export const getOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.userId;
    const {
      dateFrom,
      dateTo,
      status,
      search,
      page = "1",
      limit = "10",
      sortBy = "orderDate",
      sortOrder = "desc",
    } = req.query;

    // Build query - filter by authenticated seller
    const query: any = { sellerId };

    // Date range filter
    if (dateFrom || dateTo) {
      query.orderDate = {};
      if (dateFrom) {
        query.orderDate.$gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        query.orderDate.$lte = new Date(dateTo as string);
      }
    }

    // Status filter
    if (status && status !== 'All Status') {
      // Map frontend status to backend status
      const statusMapping: Record<string, string> = {
        'Pending': 'Pending',
        'Accepted': 'Accepted',
        'On the way': 'On the way',
        'Delivered': 'Delivered',
        'Cancelled': 'Cancelled',
      };
      query.status = statusMapping[status as string] || status;
    }

    // Search filter
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
        { 'deliveryAddress.name': { $regex: search, $options: "i" } },
        { 'deliveryAddress.phone': { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    // Get orders with populated customer and delivery info
    const orders = await Order.find(query)
      .populate("customerId", "name email phone")
      .populate("deliveryId", "name mobile")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Format response for frontend
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderId: order.orderId,
      deliveryDate: order.deliveryDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      orderDate: order.orderDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      status: order.status === 'On the way' ? 'On the way' : order.status, // Keep frontend status format
      amount: order.grandTotal,
      customerName: (order.customerId as any)?.name || '',
      customerPhone: (order.customerId as any)?.phone || '',
      deliveryBoyName: (order.deliveryId as any)?.name || '',
    }));

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: formattedOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);

/**
 * Get order by ID with populated order items, customer, and delivery info
 */
export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.userId;
    const { id } = req.params;

    // Get order with populated data
    const order = await Order.findOne({ _id: id, sellerId })
      .populate("customerId", "name email phone")
      .populate("deliveryId", "name mobile email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get order items
    const orderItems = await OrderItem.find({ orderId: id, sellerId })
      .populate("productId", "mainImageUrl")
      .sort({ createdAt: 1 });

    // Format order items for frontend
    const formattedItems = orderItems.map(item => ({
      srNo: item._id.toString().slice(-4), // Use last 4 chars of ID as srNo
      product: item.productName,
      soldBy: item.soldBy,
      unit: item.unit,
      price: item.unitPrice,
      tax: item.tax,
      taxPercent: item.taxPercent,
      qty: item.quantity,
      subtotal: item.subtotal,
    }));

    // Format order data for frontend
    const orderDetail = {
      id: order._id,
      invoiceNumber: order.invoiceNumber,
      orderDate: order.orderDate.toISOString().split('T')[0], // YYYY-MM-DD format
      deliveryDate: order.deliveryDate.toISOString().split('T')[0],
      timeSlot: order.timeSlot,
      status: order.status === 'On the way' ? 'Out For Delivery' : order.status, // Map to frontend status
      customerName: (order.customerId as any)?.name || '',
      customerEmail: (order.customerId as any)?.email || '',
      customerPhone: (order.customerId as any)?.phone || '',
      deliveryBoyName: (order.deliveryId as any)?.name || '',
      deliveryBoyPhone: (order.deliveryId as any)?.mobile || '',
      items: formattedItems,
      subtotal: order.subtotal,
      tax: order.tax,
      grandTotal: order.grandTotal,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryAddress: order.deliveryAddress,
    };

    return res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: orderDetail,
    });
  }
);

/**
 * Update order status (seller can update: Accepted, On the way, Delivered, Cancelled)
 */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Validate allowed status updates for seller
    const allowedStatuses = ['Accepted', 'On the way', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Seller can only update to: ${allowedStatuses.join(', ')}`,
      });
    }

    // Find the order
    const order = await Order.findOne({ _id: id, sellerId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if status is already the same
    if (order.status === status) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${status}`,
      });
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // If order is delivered, credit seller's balance
    if (status === 'Delivered' && previousStatus !== 'Delivered') {
      const seller = await Seller.findById(sellerId);
      if (seller) {
        // Calculate net earning (sale amount - commission)
        // Commission is stored in seller model
        const commissionRate = (seller.commission || 0) / 100;
        const commissionAmount = order.grandTotal * commissionRate;
        const netEarning = order.grandTotal - commissionAmount;

        seller.balance = (seller.balance || 0) + netEarning;
        await seller.save();

        // Log transaction
        await WalletTransaction.create({
          sellerId,
          amount: netEarning,
          type: 'Credit',
          description: `Earnings from Order #${order.orderId}`,
          reference: `ORD-${order.orderId}-${Date.now()}`,
          status: 'Completed'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: {
        id: order._id,
        status: order.status,
      },
    });
  }
);
