import { Request, Response } from "express";
import Order from "../../../models/Order";
import Product from "../../../models/Product";
import OrderItem from "../../../models/OrderItem";
import Customer from "../../../models/Customer";
import mongoose from "mongoose";

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

        // Fetch customer details
        const customer = await Customer.findById(userId);
        if (!customer) {
            if (session) await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Customer not found",
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
                latitude: address.latitude,
                longitude: address.longitude,
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

        // Apply fees
        const platformFee = Number(fees?.platformFee) || 0;
        const deliveryFee = Number(fees?.deliveryFee) || 0;
        const finalTotal = calculatedSubtotal + platformFee + deliveryFee;

        // Update Order with calculated values and items
        newOrder.subtotal = Number(calculatedSubtotal.toFixed(2));
        newOrder.total = Number(finalTotal.toFixed(2));
        newOrder.items = orderItemIds;

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

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: newOrder,
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
            address: orderObj.deliveryAddress
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
