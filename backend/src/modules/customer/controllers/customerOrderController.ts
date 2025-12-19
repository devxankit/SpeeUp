import { Request, Response } from "express";
import Order from "../../../models/Order";
import Product from "../../../models/Product";
import OrderItem from "../../../models/OrderItem";
import Customer from "../../../models/Customer";
import mongoose from "mongoose";

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, address, paymentMethod, fees } = req.body;
        const userId = req.user!.userId;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order must have at least one item",
            });
        }

        if (!address) {
            return res.status(400).json({
                success: false,
                message: "Delivery address is required",
            });
        }

        // Fetch customer details
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Initialize Order first to get an ID
        const newOrder = new Order({
            customer: userId,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            deliveryAddress: {
                address: address.address || address.street, // Fallback if format differs
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                landmark: address.landmark,
                latitude: address.latitude,
                longitude: address.longitude,
            },
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: 'Pending',
            status: 'Received', // Default status per model
            subtotal: 0, // Will update
            tax: 0,
            shipping: fees?.deliveryFee || 0,
            total: 0, // Will update
            platformFee: fees?.platformFee || 0,
            items: [] // Will populate
        });

        let calculatedSubtotal = 0;
        const orderItemIds: mongoose.Types.ObjectId[] = [];

        for (const item of items) {
            const product = await Product.findById(item.product.id).session(session);

            if (!product) {
                throw new Error(`Product not found: ${item.product.name}`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.productName}.`);
            }

            const itemPrice = product.price;
            const itemTotal = itemPrice * item.quantity;
            calculatedSubtotal += itemTotal;

            // Create OrderItem
            const newOrderItem = new OrderItem({
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
            });

            await newOrderItem.save({ session });
            orderItemIds.push(newOrderItem._id as mongoose.Types.ObjectId);

            // Decrease stock
            await Product.findByIdAndUpdate(
                item.product.id,
                { $inc: { stock: -item.quantity } },
                { session }
            );
        }

        // Apply fees
        const platformFee = fees?.platformFee || 0;
        const deliveryFee = fees?.deliveryFee || 0;
        const finalTotal = calculatedSubtotal + platformFee + deliveryFee;

        // Update Order with calculated values and items
        newOrder.subtotal = calculatedSubtotal;
        newOrder.total = finalTotal;
        newOrder.items = orderItemIds;

        await newOrder.save({ session });

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: newOrder,
        });

    } catch (error: any) {
        await session.abortTransaction();
        return res.status(500).json({
            success: false,
            message: "Error creating order",
            error: error.message,
        });
    } finally {
        session.endSession();
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
                populate: { path: 'product', select: 'productName mainImage' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Order.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: orders,
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
                    { path: 'product', select: 'productName mainImage pack manufacturer' },
                    { path: 'seller', select: 'storeName city phone fssaiLicNo' }
                ]
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error fetching order detail",
            error: error.message,
        });
    }
};
