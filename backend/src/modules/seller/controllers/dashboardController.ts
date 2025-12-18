import { Request, Response } from "express";
import Order from "../../../models/Order";
import Product from "../../../models/Product";
import Category from "../../../models/Category";
import { asyncHandler } from "../../../utils/asyncHandler";
import mongoose from "mongoose";

/**
 * Get seller's dashboard statistics
 */
export const getDashboardStats = asyncHandler(
    async (req: Request, res: Response) => {
        const sellerId = new mongoose.Types.ObjectId((req as any).user.userId);

        // 1. KPI Metrics
        const [
            totalOrders,
            completedOrders,
            pendingOrders,
            cancelledOrders,
            totalProduct,
            totalCategoryCount,
            totalSubcategoryCount,
            totalCustomerCount,
        ] = await Promise.all([
            Order.countDocuments({ sellerId }),
            Order.countDocuments({ sellerId, status: "Delivered" }),
            Order.countDocuments({ sellerId, status: "Pending" }),
            Order.countDocuments({ sellerId, status: "Cancelled" }),
            Product.countDocuments({ sellerId }),
            Product.distinct("categoryId", { sellerId }).then(ids => ids.length),
            Product.distinct("subcategoryId", { sellerId }).then(ids => ids.length),
            Order.distinct("customerId", { sellerId }).then(ids => ids.length),
        ]);

        // 2. Alert Metrics (Low Stock < 5)
        // Note: Stock is in variations. We need to check if any variation is low.
        const products = await Product.find({ sellerId });
        let soldOutProducts = 0;
        let lowStockProducts = 0;

        products.forEach(product => {
            let isSoldOut = true;
            let isLowStock = false;

            product.variations.forEach(v => {
                if (v.stock > 0) isSoldOut = false;
                if (v.stock > 0 && v.stock < 5) isLowStock = true;
            });

            if (isSoldOut) soldOutProducts++;
            else if (isLowStock) lowStockProducts++;
        });

        // 3. New Orders Table (Latest 10)
        const newOrders = await Order.find({ sellerId })
            .sort({ createdAt: -1 })
            .limit(10);

        const formattedNewOrders = newOrders.map(order => ({
            id: order.orderId,
            orderDate: order.orderDate.toLocaleDateString('en-GB'),
            status: order.status === 'On the way' ? 'Out For Delivery' : order.status,
            amount: order.grandTotal,
        }));

        // 4. Chart Data (Last 12 months)
        const currentYear = new Date().getFullYear();
        const monthlyStats = await Order.aggregate([
            {
                $match: {
                    sellerId,
                    orderDate: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$orderDate" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const yearlyOrderData = months.map((month, index) => {
            const monthStat = monthlyStats.find(s => s._id === index + 1);
            return { date: month, value: monthStat ? monthStat.count : 0 };
        });

        // 5. Daily Chart Data (Current Month)
        const currentMonth = new Date().getMonth() + 1;
        const dailyStats = await Order.aggregate([
            {
                $match: {
                    sellerId,
                    orderDate: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
                    }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$orderDate" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const dailyOrderData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayStat = dailyStats.find(s => s._id === day);
            return { date: day.toString(), value: dayStat ? dayStat.count : 0 };
        });

        return res.status(200).json({
            success: true,
            message: "Dashboard stats fetched successfully",
            data: {
                stats: {
                    totalUser: totalCustomerCount, // Backend doesn't track "Total User" per seller yet, usually Admin metric
                    totalCategory: totalCategoryCount,
                    totalSubcategory: totalSubcategoryCount,
                    totalProduct,
                    totalOrders,
                    completedOrders,
                    pendingOrders,
                    cancelledOrders,
                    soldOutProducts,
                    lowStockProducts,
                    yearlyOrderData,
                    dailyOrderData
                },
                newOrders: formattedNewOrders
            }
        });
    }
);
