import { Request, Response } from "express";
import Order from "../../../models/Order";
import Product from "../../../models/Product";
import OrderItem from "../../../models/OrderItem";
import Customer from "../../../models/Customer";
import mongoose from "mongoose";
import { notifyDeliveryBoysOfNewOrder } from "../../../services/orderNotificationService";
import { Server as SocketIOServer } from "socket.io";
import { deductWalletForOrder, checkWalletBalance } from "../../../services/customerWalletService";

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
    let session: mongoose.ClientSession | null = null;
    try {
        // Only start session if we are on a replica set (required for transactions)
        // For simplicity in local dev, we check and fallback if it fails
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (sessionError) {
            console.warn("MongoDB Transactions not supported or failed to start. Proceeding without transaction.");
            session = null;
        }

        const { items, address, paymentMethod, fees } = req.body;
        const userId = req.user!.userId;

        // Log incoming request for debugging
        console.log("DEBUG: Order creation request:", {
            userId,
            itemsCount: items?.length,
            hasAddress: !!address,
            addressLat: address?.latitude,
            addressLng: address?.longitude,
            paymentMethod,
        });

        if (!items || items.length === 0) {
            if (session) await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Order must have at least one item",
            });
        }

        if (!address) {
            if (session) await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Delivery address is required",
            });
        }

        // Validate required address fields
        if (!address.city || (typeof address.city === 'string' && address.city.trim() === '')) {
            if (session) await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "City is required in delivery address",
                details: {
                    receivedCity: address.city,
                    addressObject: address
                }
            });
        }

        if (!address.pincode || (typeof address.pincode === 'string' && address.pincode.trim() === '')) {
            if (session) await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Pincode is required in delivery address",
                details: {
                    receivedPincode: address.pincode,
                    addressObject: address
                }
            });
        }

        // Fetch customer details
        const customer = await Customer.findById(userId);
        if (!customer) {
            if (session) await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Validate delivery address location
        // Handle both string and number types, and check for null/undefined (not truthy, since 0 is valid)
        const deliveryLat = address.latitude != null
            ? (typeof address.latitude === 'number' ? address.latitude : parseFloat(address.latitude))
            : null;
        const deliveryLng = address.longitude != null
            ? (typeof address.longitude === 'number' ? address.longitude : parseFloat(address.longitude))
            : null;

        if (deliveryLat == null || deliveryLng == null || isNaN(deliveryLat) || isNaN(deliveryLng)) {
            if (session) await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Delivery address location (latitude/longitude) is required",
                details: {
                    receivedLatitude: address.latitude,
                    receivedLongitude: address.longitude,
                    parsedLatitude: deliveryLat,
                    parsedLongitude: deliveryLng,
                }
            });
        }

        // Validate coordinates
        if (deliveryLat < -90 || deliveryLat > 90 || deliveryLng < -180 || deliveryLng > 180) {
            if (session) await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Invalid delivery address coordinates",
            });
        }

        // Initialize Order first to get an ID
        const newOrder = new Order({
            customer: new mongoose.Types.ObjectId(userId),
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            deliveryAddress: {
                address: address.address || address.street || 'N/A',
                city: address.city || 'N/A',
                state: address.state || '',
                pincode: address.pincode || '000000',
                landmark: address.landmark || '',
                latitude: deliveryLat,
                longitude: deliveryLng,
            },
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: 'Pending',
            status: 'Received',
            subtotal: 0,
            tax: 0,
            shipping: fees?.deliveryFee || 0,
            platformFee: fees?.platformFee || 0,
            discount: 0,
            total: 0,
            items: []
        });

        let calculatedSubtotal = 0;
        const orderItemIds: mongoose.Types.ObjectId[] = [];
        const sellerIds = new Set<string>(); // Track unique sellers

        for (const item of items) {
            if (!item.product || !item.product.id) {
                throw new Error("Invalid item structure: product.id is missing");
            }

            const product = session
                ? await Product.findById(item.product.id).session(session)
                : await Product.findById(item.product.id);

            if (!product) {
                throw new Error(`Product not found: ${item.product.name || 'ID: ' + item.product.id}`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.productName}. Available: ${product.stock}, Requested: ${item.quantity}`);
            }

            // Track seller IDs to validate location
            if (product.seller) {
                sellerIds.add(product.seller.toString());
            }

            const itemPrice = product.price;
            const itemTotal = itemPrice * item.quantity;
            calculatedSubtotal += itemTotal;

            // Create OrderItem
            const newOrderItemData = {
                order: newOrder._id,
                product: product._id,
                seller: product.seller,
                productName: product.productName,
                productImage: product.mainImage,
                sku: product.sku,
                unitPrice: itemPrice,
                quantity: item.quantity,
                total: itemTotal,
                variation: item.variant,
                status: 'Pending'
            };

            const newOrderItem = new OrderItem(newOrderItemData);
            if (session) {
                await newOrderItem.save({ session });
            } else {
                await newOrderItem.save();
            }
            orderItemIds.push(newOrderItem._id as mongoose.Types.ObjectId);

            // Decrease stock
            const updateOptions = session ? { session } : {};
            await Product.findByIdAndUpdate(
                item.product.id,
                { $inc: { stock: -item.quantity } },
                updateOptions
            );
        }

        // LOCATION VALIDATION DISABLED: Allow customers to order from any seller regardless of location
        // Validate all sellers can deliver to user's location
        /*
        if (sellerIds.size > 0) {
            const uniqueSellerIds = Array.from(sellerIds).map(id => new mongoose.Types.ObjectId(id));

            // Find sellers and check if user is within their service radius
            const sellers = await Seller.find({
                _id: { $in: uniqueSellerIds },
                status: "Approved",
                location: { $exists: true, $ne: null },
            });

            // Helper function to calculate distance between two coordinates (Haversine formula)
            function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
                const R = 6371; // Earth radius in kilometers
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            }

            // Check each seller can deliver to user's location
            for (const seller of sellers) {
                if (!seller.location || !seller.location.coordinates) {
                    if (session) await session.abortTransaction();
                    return res.status(403).json({
                        success: false,
                        message: `Seller ${seller.storeName} does not have a valid location. Order cannot be placed.`,
                    });
                }

                const sellerLng = seller.location.coordinates[0];
                const sellerLat = seller.location.coordinates[1];
                const distance = calculateDistance(deliveryLat, deliveryLng, sellerLat, sellerLng);
                const serviceRadius = seller.serviceRadiusKm || 10;

                if (distance > serviceRadius) {
                    if (session) await session.abortTransaction();
                    return res.status(403).json({
                        success: false,
                        message: `Your delivery address is ${distance.toFixed(2)} km away from ${seller.storeName}. They only deliver within ${serviceRadius} km. Please select products from sellers in your area.`,
                    });
                }
            }
        }
        */

        // Apply fees
        const platformFee = Number(fees?.platformFee) || 0;
        const deliveryFee = Number(fees?.deliveryFee) || 0;
        const finalTotal = calculatedSubtotal + platformFee + deliveryFee;

        // Update Order with calculated values and items
        newOrder.subtotal = Number(calculatedSubtotal.toFixed(2));
        newOrder.total = Number(finalTotal.toFixed(2));
        newOrder.items = orderItemIds;

        // Handle wallet payment for prepaid orders
        let walletPaymentResult = null;
        if (paymentMethod === 'Wallet' || paymentMethod === 'wallet') {
            // Check if customer has sufficient wallet balance
            const balanceCheck = await checkWalletBalance(userId, finalTotal);

            if (!balanceCheck.sufficient) {
                if (session) await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient wallet balance. Available: ₹${balanceCheck.balance.toFixed(2)}, Required: ₹${finalTotal.toFixed(2)}`,
                    data: {
                        availableBalance: balanceCheck.balance,
                        requiredAmount: finalTotal,
                    }
                });
            }

            // Deduct from wallet (we need orderNumber which is generated on save, so we'll do this after save)
            // For now, mark payment as pending and process after save
            newOrder.paymentStatus = 'Processing';
        }

        if (session) {
            await newOrder.save({ session });
            await session.commitTransaction();
        } else {
            // Validate before saving to catch errors with details
            const validationError = newOrder.validateSync();
            if (validationError) {
                console.error("DEBUG: Order Validation Error:", validationError.errors);
                throw validationError;
            }
            await newOrder.save();
        }

        // Process wallet payment after order is saved (now we have orderNumber)
        if (paymentMethod === 'Wallet' || paymentMethod === 'wallet') {
            const savedOrder = await Order.findById(newOrder._id);
            if (savedOrder) {
                walletPaymentResult = await deductWalletForOrder(
                    userId,
                    finalTotal,
                    savedOrder._id.toString(),
                    savedOrder.orderNumber || ''
                );

                if (walletPaymentResult.success) {
                    // Update order payment status to completed
                    await Order.findByIdAndUpdate(newOrder._id, {
                        paymentStatus: 'Completed',
                        paidAt: new Date(),
                    });
                    console.log(`✅ Wallet payment successful for order ${savedOrder.orderNumber}`);
                } else {
                    // Payment failed - rollback order
                    console.error(`❌ Wallet payment failed for order ${savedOrder.orderNumber}: ${walletPaymentResult.message}`);

                    // Mark order as payment failed
                    await Order.findByIdAndUpdate(newOrder._id, {
                        paymentStatus: 'Failed',
                        status: 'Cancelled',
                        cancellationReason: 'Payment failed: ' + walletPaymentResult.message,
                    });

                    // Restore stock for all items
                    for (const itemId of orderItemIds) {
                        const orderItem = await OrderItem.findById(itemId);
                        if (orderItem) {
                            await Product.findByIdAndUpdate(
                                orderItem.product,
                                { $inc: { stock: orderItem.quantity } }
                            );
                        }
                    }

                    return res.status(400).json({
                        success: false,
                        message: `Wallet payment failed: ${walletPaymentResult.message}`,
                    });
                }
            }
        }

        // Emit notification to all available delivery boys
        try {
            const io: SocketIOServer = (req.app.get("io") as SocketIOServer);
            if (io) {
                // Reload order to ensure orderNumber is set (generated by pre-validate hook)
                const savedOrder = await Order.findById(newOrder._id).lean();
                if (savedOrder) {
                    await notifyDeliveryBoysOfNewOrder(io, savedOrder);
                }
            }
        } catch (notificationError) {
            // Log error but don't fail the order creation
            console.error("Error notifying delivery boys:", notificationError);
        }

        // Prepare response message
        let responseMessage = "Order placed successfully";
        if (walletPaymentResult?.success) {
            responseMessage = `Order placed and ₹${finalTotal.toFixed(2)} paid from wallet. New balance: ₹${walletPaymentResult.newBalance?.toFixed(2)}`;
        }

        return res.status(201).json({
            success: true,
            message: responseMessage,
            data: newOrder,
            walletPayment: walletPaymentResult ? {
                transactionId: walletPaymentResult.transactionId,
                newBalance: walletPaymentResult.newBalance,
            } : undefined,
        });

    } catch (error: any) {
        if (session) {
            try {
                await session.abortTransaction();
            } catch (abortError) {
                console.error("Error aborting transaction:", abortError);
            }
        }

        console.error("DEBUG: Order Creation Error Detail:", {
            message: error.message,
            name: error.name,
            errors: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message,
                value: error.errors[key].value
            })) : undefined,
            stack: error.stack,
            body: req.body
        });

        // Return a more informative error message if it's a validation error
        let errorMessage = "Error creating order. " + error.message;
        if (error.name === 'ValidationError') {
            const fields = Object.keys(error.errors).join(', ');
            errorMessage = `Validation failed for fields: ${fields}. ${error.message}`;
        }

        return res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message,
            details: error.errors,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        if (session) session.endSession();
    }
};

// Get authenticated customer's orders
export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { status, page = 1, limit = 10 } = req.query;

        const query: any = { customer: userId };

        if (status) {
            query.status = status; // Note: Model field is 'status', not 'orderStatus'
        }

        const skip = (Number(page) - 1) * Number(limit);

        const orders = await Order.find(query)
            .populate({
                path: 'items',
                populate: { path: 'product', select: 'productName mainImage price' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Order.countDocuments(query);

        // Transform orders to match frontend Order type
        const transformedOrders = orders.map(order => {
            const orderObj = order.toObject();
            return {
                ...orderObj,
                id: orderObj._id.toString(),
                totalItems: Array.isArray(orderObj.items) ? orderObj.items.length : 0,
                totalAmount: orderObj.total,
                fees: {
                    platformFee: orderObj.platformFee || 0,
                    deliveryFee: orderObj.shipping || 0
                },
                // Keep original fields for backward compatibility
                subtotal: orderObj.subtotal,
                address: orderObj.deliveryAddress
            };
        });

        return res.status(200).json({
            success: true,
            data: transformedOrders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error fetching orders",
            error: error.message,
        });
    }
};

// Get single order details
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;

        // Find order and ensure it belongs to the user
        const order = await Order.findOne({ _id: id, customer: userId })
            .populate({
                path: 'items',
                populate: [
                    { path: 'product', select: 'productName mainImage pack manufacturer price' },
                    { path: 'seller', select: 'storeName city phone fssaiLicNo' }
                ]
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Transform order to match frontend Order type
        const orderObj = order.toObject();
        const transformedOrder = {
            ...orderObj,
            id: orderObj._id.toString(),
            totalItems: Array.isArray(orderObj.items) ? orderObj.items.length : 0,
            totalAmount: orderObj.total,
            fees: {
                platformFee: orderObj.platformFee || 0,
                deliveryFee: orderObj.shipping || 0
            },
            // Keep original fields for backward compatibility
            subtotal: orderObj.subtotal,
            address: orderObj.deliveryAddress,
            // Include invoice enabled flag
            invoiceEnabled: orderObj.invoiceEnabled || false
        };

        return res.status(200).json({
            success: true,
            data: transformedOrder,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error fetching order detail",
            error: error.message,
        });
    }
};
