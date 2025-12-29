import { Server as SocketIOServer } from 'socket.io';
import Delivery from '../models/Delivery';
import Order from '../models/Order';
import Seller from '../models/Seller';
import DeliveryTracking from '../models/DeliveryTracking';
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
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

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
 * Find delivery boys near a specific location within a radius
 * Uses the delivery boy's last known location from DeliveryTracking
 */
export async function findDeliveryBoysNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
): Promise<{ deliveryBoyId: mongoose.Types.ObjectId; distance: number }[]> {
    try {
        // Get all active and online delivery boys
        const deliveryBoys = await Delivery.find({
            isOnline: true,
            status: 'Active',
        }).select('_id');

        if (deliveryBoys.length === 0) {
            return [];
        }

        // Get latest locations for these delivery boys from DeliveryTracking
        const deliveryBoyIds = deliveryBoys.map(db => db._id);

        // Get the most recent tracking record for each delivery boy
        const trackingRecords = await DeliveryTracking.aggregate([
            {
                $match: {
                    deliveryBoy: { $in: deliveryBoyIds },
                    'currentLocation.lat': { $exists: true },
                    'currentLocation.lng': { $exists: true },
                }
            },
            {
                $sort: { 'currentLocation.timestamp': -1 }
            },
            {
                $group: {
                    _id: '$deliveryBoy',
                    latestLocation: { $first: '$currentLocation' }
                }
            }
        ]);

        // Calculate distance and filter by radius
        const nearbyDeliveryBoys: { deliveryBoyId: mongoose.Types.ObjectId; distance: number }[] = [];

        for (const record of trackingRecords) {
            const deliveryLat = record.latestLocation?.lat;
            const deliveryLng = record.latestLocation?.lng;

            if (deliveryLat && deliveryLng) {
                const distance = calculateDistance(latitude, longitude, deliveryLat, deliveryLng);

                if (distance <= radiusKm) {
                    nearbyDeliveryBoys.push({
                        deliveryBoyId: record._id,
                        distance,
                    });
                }
            }
        }

        // Also include delivery boys who don't have tracking data yet (they might be new)
        // but give them a default distance
        const trackedIds = new Set(trackingRecords.map(r => r._id.toString()));
        for (const db of deliveryBoys) {
            if (!trackedIds.has(db._id.toString())) {
                // Include untracked delivery boys with a default distance
                nearbyDeliveryBoys.push({
                    deliveryBoyId: db._id,
                    distance: radiusKm / 2, // Default to half the radius
                });
            }
        }

        // Sort by distance (nearest first)
        nearbyDeliveryBoys.sort((a, b) => a.distance - b.distance);

        console.log(`📍 Found ${nearbyDeliveryBoys.length} delivery boys within ${radiusKm}km`);
        return nearbyDeliveryBoys;
    } catch (error) {
        console.error('Error finding nearby delivery boys:', error);
        return [];
    }
}

/**
 * Find delivery boys near seller locations for an order
 * Aggregates all unique sellers from order items and finds delivery boys within their service radius
 */
export async function findDeliveryBoysNearSellerLocations(
    order: any
): Promise<mongoose.Types.ObjectId[]> {
    try {
        // Get unique seller IDs from order items
        const sellerIds = [...new Set(
            order.items
                ?.map((item: any) => item.seller?.toString())
                .filter((id: string) => id) || []
        )];

        if (sellerIds.length === 0) {
            console.log('No sellers found in order, falling back to all available delivery boys');
            return findAvailableDeliveryBoys();
        }

        // Get seller locations
        const sellers = await Seller.find({
            _id: { $in: sellerIds },
        }).select('latitude longitude serviceRadiusKm storeName');

        if (sellers.length === 0) {
            console.log('No seller data found, falling back to all available delivery boys');
            return findAvailableDeliveryBoys();
        }

        // Find delivery boys near each seller location
        const nearbyDeliveryBoyMap = new Map<string, { distance: number }>();

        for (const seller of sellers) {
            const lat = seller.latitude ? parseFloat(seller.latitude) : null;
            const lng = seller.longitude ? parseFloat(seller.longitude) : null;

            if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                console.log(`Seller ${seller.storeName} has no valid location, skipping`);
                continue;
            }

            const radius = seller.serviceRadiusKm || 10; // Default 10km
            const nearbyBoys = await findDeliveryBoysNearLocation(lat, lng, radius);

            for (const boy of nearbyBoys) {
                const boyId = boy.deliveryBoyId.toString();
                // Keep the smallest distance if same delivery boy is near multiple sellers
                if (!nearbyDeliveryBoyMap.has(boyId) || nearbyDeliveryBoyMap.get(boyId)!.distance > boy.distance) {
                    nearbyDeliveryBoyMap.set(boyId, { distance: boy.distance });
                }
            }
        }

        if (nearbyDeliveryBoyMap.size === 0) {
            console.log('No delivery boys found near seller locations, falling back to all available');
            return findAvailableDeliveryBoys();
        }

        // Sort by distance and return IDs
        const sortedBoys = Array.from(nearbyDeliveryBoyMap.entries())
            .sort((a, b) => a[1].distance - b[1].distance)
            .map(([id]) => new mongoose.Types.ObjectId(id));

        console.log(`📍 Found ${sortedBoys.length} delivery boys near seller locations`);
        return sortedBoys;
    } catch (error) {
        console.error('Error finding delivery boys near seller locations:', error);
        return findAvailableDeliveryBoys();
    }
}

/**
 * Emit new order notification to delivery boys near seller locations
 * Prioritizes delivery boys within the seller's service radius
 */
export async function notifyDeliveryBoysOfNewOrder(
    io: SocketIOServer,
    order: any
): Promise<void> {
    try {
        // Find delivery boys near seller locations (within service radius)
        const nearbyDeliveryBoyIds = await findDeliveryBoysNearSellerLocations(order);

        if (nearbyDeliveryBoyIds.length === 0) {
            console.log('No available delivery boys to notify (including fallback)');
            return;
        }

        // Initialize notification state
        const orderId = order._id.toString();
        notificationStates.set(orderId, {
            orderId,
            notifiedDeliveryBoys: new Set(nearbyDeliveryBoyIds.map(id => id.toString())),
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
        for (const deliveryBoyId of nearbyDeliveryBoyIds) {
            io.to(`delivery-${deliveryBoyId}`).emit('new-order', orderData);
        }

        console.log(`📢 Notified ${nearbyDeliveryBoyIds.length} delivery boys near seller locations about order ${order.orderNumber}`);
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

        // Emit delivery-boy-accepted event to customer for tracking
        io.to(`order-${orderId}`).emit('delivery-boy-accepted', {
            orderId,
            deliveryBoyId,
            message: 'Delivery boy accepted your order. Tracking started.',
        });

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

