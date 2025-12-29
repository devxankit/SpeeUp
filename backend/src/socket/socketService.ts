import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { handleOrderAcceptance, handleOrderRejection } from '../services/orderNotificationService';

export const initializeSocket = (httpServer: HttpServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or server-to-server)
                if (!origin) return callback(null, true);

                // In production, check against allowed origins
                if (process.env.NODE_ENV === 'production') {
                    // Get allowed origins from environment variable (comma-separated)
                    const frontendUrl = process.env.FRONTEND_URL || "";
                    const allowedOrigins = frontendUrl
                        .split(",")
                        .map((url) => url.trim())
                        .filter((url) => url.length > 0);

                    // Default production origins if FRONTEND_URL not set
                    const defaultOrigins = [
                        "https://www.speeup.com",
                        "https://speeup.com",
                    ];

                    const allAllowedOrigins = allowedOrigins.length > 0
                        ? [...allowedOrigins, ...defaultOrigins]
                        : defaultOrigins;

                    // Normalize origins for comparison (remove trailing slash, lowercase)
                    const normalizeUrl = (url: string) => url.replace(/\/$/, '').toLowerCase();
                    const normalizedOrigin = normalizeUrl(origin);

                    // Check if origin matches any allowed origin
                    const isAllowed = allAllowedOrigins.some((allowedOrigin) => {
                        const normalizedAllowed = normalizeUrl(allowedOrigin);

                        // Exact match
                        if (normalizedOrigin === normalizedAllowed) return true;

                        // Support for www and non-www variants
                        if (normalizedAllowed.includes("www.")) {
                            const nonWww = normalizedAllowed.replace("www.", "");
                            if (normalizedOrigin === nonWww) return true;
                        } else {
                            const withWww = normalizedAllowed.replace(/^(https?:\/\/)/, "$1www.");
                            if (normalizedOrigin === withWww) return true;
                        }
                        return false;
                    });

                    if (!isAllowed) {
                        console.warn(`⚠️ Socket.io connection rejected from origin: ${origin}. Allowed origins: ${allAllowedOrigins.join(', ')}`);
                    }

                    return callback(null, isAllowed);
                }

                // In development, allow any localhost port
                if (
                    origin.startsWith('http://localhost:') ||
                    origin.startsWith('http://127.0.0.1:') ||
                    origin.startsWith('https://localhost:')
                ) {
                    return callback(null, true);
                }

                return callback(null, false);
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
        // Production-specific Socket.io configuration
        allowEIO3: true, // Allow Engine.IO v3 clients
        pingTimeout: 60000, // 60 seconds
        pingInterval: 25000, // 25 seconds
        transports: ['websocket', 'polling'], // Allow both transports
        upgradeTimeout: 30000, // 30 seconds for upgrade
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            // Allow connection but mark as unauthenticated
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            (socket as any).user = decoded;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('✅ Socket connected:', socket.id, 'User:', (socket as any).user?.userId || 'Unauthenticated');

        // Customer subscribes to order tracking
        socket.on('track-order', (orderId: string) => {
            console.log(`📦 Customer tracking order: ${orderId}`);
            socket.join(`order-${orderId}`);

            // Send acknowledgment
            socket.emit('tracking-started', {
                orderId,
                message: 'Live tracking started',
            });
        });

        // Customer unsubscribes from order tracking
        socket.on('stop-tracking', (orderId: string) => {
            console.log(`🛑 Stopped tracking order: ${orderId}`);
            socket.leave(`order-${orderId}`);
        });

        // Delivery partner joins their active deliveries room
        socket.on('join-delivery-room', (deliveryPartnerId: string) => {
            console.log(`🛵 Delivery partner joined: ${deliveryPartnerId}`);
            socket.join(`delivery-${deliveryPartnerId}`);
        });

        // Delivery boy joins notification room
        socket.on('join-delivery-notifications', (deliveryBoyId: string) => {
            console.log(`🔔 Delivery boy ${deliveryBoyId} joined notifications room`);
            socket.join('delivery-notifications');
            socket.join(`delivery-${deliveryBoyId}`);

            // Send confirmation that they joined successfully
            socket.emit('joined-notifications-room', {
                success: true,
                message: 'Successfully joined delivery notifications room',
                deliveryBoyId
            });
        });

        // Handle order acceptance
        socket.on('accept-order', async (data: { orderId: string; deliveryBoyId: string }) => {
            console.log(`✅ Delivery boy ${data.deliveryBoyId} accepting order ${data.orderId}`);
            const result = await handleOrderAcceptance(io, data.orderId, data.deliveryBoyId);
            socket.emit('accept-order-response', result);
        });

        // Handle order rejection
        socket.on('reject-order', async (data: { orderId: string; deliveryBoyId: string }) => {
            console.log(`❌ Delivery boy ${data.deliveryBoyId} rejecting order ${data.orderId}`);
            const result = await handleOrderRejection(io, data.orderId, data.deliveryBoyId);
            socket.emit('reject-order-response', result);
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', socket.id, 'Reason:', reason);
        });

        // Error handling
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Handle connection errors
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });
    });

    console.log('🔌 Socket.io initialized');
    return io;
};

// Helper function to emit location updates
export const emitLocationUpdate = (
    io: SocketIOServer,
    orderId: string,
    data: {
        location: { latitude: number; longitude: number; timestamp: Date };
        eta: number;
        distance: number;
        status: string;
    }
) => {
    io.to(`order-${orderId}`).emit('location-update', {
        orderId,
        ...data,
        timestamp: new Date(),
    });
};
