import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import DeliveryTracking from "../../../models/DeliveryTracking";
import Order from "../../../models/Order";

/**
 * Get tracking information for an order
 * GET /api/v1/customer/orders/:orderId/tracking
 */
export const getOrderTracking = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const customerId = (req as any).user.id;

    // Verify order belongs to customer
    const order = await Order.findOne({ _id: orderId, customer: customerId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get latest tracking information
    const tracking = await DeliveryTracking.findOne({ order: orderId })
      .sort({ updatedAt: -1 })
      .populate("deliveryBoy", "name phone profileImage")
      .lean();

    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking information not available yet",
      });
    }

    // Get delivery address from order
    const deliveryAddress = order.deliveryAddress;

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        tracking: {
          deliveryBoy: tracking.deliveryBoy,
          currentLocation: tracking.currentLocation,
          route: tracking.route,
          eta: tracking.eta,
          distance: tracking.distance,
          status: tracking.status,
          lastUpdated: tracking.updatedAt,
        },
        deliveryAddress: deliveryAddress,
      },
    });
  }
);

/**
 * Update delivery partner location (called by delivery app)
 * POST /api/v1/delivery/location
 */
export const updateDeliveryLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId, latitude, longitude } = req.body;
    const deliveryBoyId = (req as any).user.id;

    // Validate inputs
    if (!orderId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Order ID, latitude, and longitude are required",
      });
    }

    // Verify order is assigned to this delivery partner
    const order = await Order.findOne({
      _id: orderId,
      deliveryBoy: deliveryBoyId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not assigned to you",
      });
    }

    // Calculate distance to delivery address
    const deliveryLat = order.deliveryAddress?.latitude || 0;
    const deliveryLng = order.deliveryAddress?.longitude || 0;

    // Find or create tracking record
    let tracking = await DeliveryTracking.findOne({ order: orderId });

    if (!tracking) {
      tracking = new DeliveryTracking({
        order: orderId,
        deliveryBoy: deliveryBoyId,
        currentLocation: {
          latitude,
          longitude,
          timestamp: new Date(),
        },
        route: [],
        status: "picked_up",
      });
    } else {
      tracking.currentLocation = {
        latitude,
        longitude,
        timestamp: new Date(),
      };
      // Add to route history (keep last 50 points)
      tracking.route.push({ lat: latitude, lng: longitude });
      if (tracking.route.length > 50) {
        tracking.route = tracking.route.slice(-50);
      }
    }

    // Calculate distance and ETA
    const distance = tracking.calculateDistance(deliveryLat, deliveryLng);
    const eta = tracking.calculateETA(distance);

    tracking.distance = distance;
    tracking.eta = eta;

    // Update status based on distance
    if (distance < 100) {
      tracking.status = "nearby";
    } else if (distance < 5000) {
      tracking.status = "in_transit";
    } else {
      tracking.status = "picked_up";
    }

    await tracking.save();

    // Emit update via Socket.io (will be handled in socket service)
    const io = (req.app as any).get("io");
    if (io) {
      io.to(`order-${orderId}`).emit("location-update", {
        orderId,
        location: tracking.currentLocation,
        eta: tracking.eta,
        distance: tracking.distance,
        status: tracking.status,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: {
        distance,
        eta,
        status: tracking.status,
      },
    });
  }
);

/**
 * Get delivery partner's active orders with tracking
 * GET /api/v1/delivery/active-orders
 */
export const getActiveOrdersTracking = asyncHandler(
  async (req: Request, res: Response) => {
    const deliveryBoyId = (req as any).user.id;

    const trackings = await DeliveryTracking.find({
      deliveryBoy: deliveryBoyId,
      status: { $in: ["picked_up", "in_transit", "nearby"] },
    })
      .populate("order", "orderNumber status deliveryAddress")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: trackings,
    });
  }
);
