import { Server as SocketIOServer } from 'socket.io';
import Delivery from '../models/Delivery';
import Order from '../models/Order';
import mongoose from 'mongoose';

// Track order notification state
interface OrderNotificationState {
    orderId: string;
    notifiedDeliveryBoys: Set<string>;
    rejectedDeliveryBoys: Set<string>;
    acceptedBy: string | null;
}

const notificationStates = new Map<string, OrderNotificationState>();

/**
 * Find all available delivery boys (online and active)
 */
export async function findAvailableDeliveryBoys(): Promise<mongoose.Types.ObjectId[]> {
    try {
        const deliveryBoys = await Delivery.find({
            isOnline: true,
            status: 'Active',
        }).select('_id');

        return deliveryBoys.map(db => db._id);
    } catch (error) {
        console.error('Error finding available delivery boys:', error);
        return [];
    }
}

/**
 * Emit new order notification to all available delivery boys
 */
export async function notifyDeliveryBoysOfNewOrder(
    io: SocketIOServer,
    order: any
): Promise<void> {
    try {
        const availableDeliveryBoyIds = await findAvailableDeliveryBoys();

        if (availableDeliveryBoyIds.length === 0) {
            console.log('No available delivery boys to notify');
            return;
        }

        // Initialize notification state
        const orderId = order._id.toString();
        notificationStates.set(orderId, {
            orderId,
            notifiedDeliveryBoys: new Set(availableDeliveryBoyIds.map(id => id.toString())),
            rejectedDeliveryBoys: new Set(),
            acceptedBy: null,
        });

        // Prepare order data for notification
        const orderData = {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            deliveryAddress: {
                address: order.deliveryAddress.address,
                city: order.deliveryAddress.city,
                state: order.deliveryAddress.state,
                pincode: order.deliveryAddress.pincode,
            },
            total: order.total,
            subtotal: order.subtotal,
            shipping: order.shipping,
            createdAt: order.createdAt,
        };

        // Emit to all delivery boys
        // Each delivery boy should be in a room like "delivery-notifications-{deliveryBoyId}"
        // But we'll also emit to a general "delivery-notifications" room
        io.to('delivery-notifications').emit('new-order', orderData);

        // Also emit to individual delivery boy rooms
        for (const deliveryBoyId of availableDeliveryBoyIds) {
            io.to(`delivery-${deliveryBoyId}`).emit('new-order', orderData);
        }

        console.log(`📢 Notified ${availableDeliveryBoyIds.length} delivery boys about order ${order.orderNumber}`);
    } catch (error) {
        console.error('Error notifying delivery boys:', error);
    }
}

/**
 * Handle order acceptance by a delivery boy
 */
export async function handleOrderAcceptance(
    io: SocketIOServer,
    orderId: string,
    deliveryBoyId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const state = notificationStates.get(orderId);

        if (!state) {
            return { success: false, message: 'Order notification not found' };
        }

        // Check if already accepted
        if (state.acceptedBy) {
            return { success: false, message: 'Order already accepted by another delivery boy' };
        }

        // Check if this delivery boy was notified
        if (!state.notifiedDeliveryBoys.has(deliveryBoyId)) {
            return { success: false, message: 'You were not notified about this order' };
        }

        // Check if this delivery boy already rejected
        if (state.rejectedDeliveryBoys.has(deliveryBoyId)) {
            return { success: false, message: 'You have already rejected this order' };
        }

        // Mark as accepted
        state.acceptedBy = deliveryBoyId;

        // Update order in database
        const order = await Order.findById(orderId);
        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        // Check if order already has a delivery boy assigned
        if (order.deliveryBoy) {
            return { success: false, message: 'Order already assigned to another delivery boy' };
        }

        // Assign order to delivery boy
        order.deliveryBoy = new mongoose.Types.ObjectId(deliveryBoyId);
        order.deliveryBoyStatus = 'Assigned';
        order.assignedAt = new Date();
        await order.save();

        // Emit order-accepted event to stop notifications for all delivery boys
        io.to('delivery-notifications').emit('order-accepted', {
            orderId,
            acceptedBy: deliveryBoyId,
        });

        // Also emit to individual rooms
        for (const notifiedId of state.notifiedDeliveryBoys) {
            io.to(`delivery-${notifiedId}`).emit('order-accepted', {
                orderId,
                acceptedBy: deliveryBoyId,
            });
        }

        // Clean up notification state
        notificationStates.delete(orderId);

        console.log(`✅ Order ${orderId} accepted by delivery boy ${deliveryBoyId}`);
        return { success: true, message: 'Order accepted successfully' };
    } catch (error) {
        console.error('Error handling order acceptance:', error);
        return { success: false, message: 'Error accepting order' };
    }
}

/**
 * Handle order rejection by a delivery boy
 */
export async function handleOrderRejection(
    io: SocketIOServer,
    orderId: string,
    deliveryBoyId: string
): Promise<{ success: boolean; message: string; allRejected: boolean }> {
    try {
        const state = notificationStates.get(orderId);

        if (!state) {
            return { success: false, message: 'Order notification not found', allRejected: false };
        }

        // Check if already accepted
        if (state.acceptedBy) {
            return { success: false, message: 'Order already accepted', allRejected: false };
        }

        // Check if this delivery boy was notified
        if (!state.notifiedDeliveryBoys.has(deliveryBoyId)) {
            return { success: false, message: 'You were not notified about this order', allRejected: false };
        }

        // Check if already rejected
        if (state.rejectedDeliveryBoys.has(deliveryBoyId)) {
            return { success: false, message: 'You have already rejected this order', allRejected: false };
        }

        // Mark as rejected
        state.rejectedDeliveryBoys.add(deliveryBoyId);

        // Check if all delivery boys have rejected
        const allRejected = state.rejectedDeliveryBoys.size === state.notifiedDeliveryBoys.size;

        if (allRejected) {
            // Emit order-rejected-by-all event
            io.to('delivery-notifications').emit('order-rejected-by-all', {
                orderId,
            });

            // Clean up notification state
            notificationStates.delete(orderId);

            console.log(`❌ All delivery boys rejected order ${orderId}`);
        } else {
            // Emit rejection acknowledgment to the specific delivery boy
            io.to(`delivery-${deliveryBoyId}`).emit('order-rejection-acknowledged', {
                orderId,
            });
        }

        console.log(`🚫 Delivery boy ${deliveryBoyId} rejected order ${orderId}`);
        return { success: true, message: 'Order rejected', allRejected };
    } catch (error) {
        console.error('Error handling order rejection:', error);
        return { success: false, message: 'Error rejecting order', allRejected: false };
    }
}

/**
 * Get notification state for an order
 */
export function getNotificationState(orderId: string): OrderNotificationState | undefined {
    return notificationStates.get(orderId);
}

/**
 * Clean up notification state (for testing or manual cleanup)
 */
export function clearNotificationState(orderId: string): void {
    notificationStates.delete(orderId);
}

