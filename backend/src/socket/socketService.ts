import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

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

                    // Check if origin matches any allowed origin
                    const isAllowed = allAllowedOrigins.some((allowedOrigin) => {
                        // Exact match
                        if (origin === allowedOrigin) return true;
                        // Support for www and non-www variants
                        if (allowedOrigin.includes("www.")) {
                            const nonWww = allowedOrigin.replace("www.", "");
                            if (origin === nonWww) return true;
                        } else {
                            const withWww = allowedOrigin.replace(/^(https?:\/\/)/, "$1www.");
                            if (origin === withWww) return true;
                        }
                        return false;
                    });

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
        console.log('✅ Socket connected:', socket.id);

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

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected:', socket.id);
        });

        // Error handling
        socket.on('error', (error) => {
            console.error('Socket error:', error);
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
