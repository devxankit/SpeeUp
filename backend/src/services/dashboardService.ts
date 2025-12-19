import Customer from "../models/Customer";
import Category from "../models/Category";
import SubCategory from "../models/SubCategory";
import Product from "../models/Product";
import Order from "../models/Order";
// import OrderItem from "../models/OrderItem";
// import Seller from "../models/Seller";

export interface DashboardStats {
  totalUser: number;
  totalCategory: number;
  totalSubcategory: number;
  totalProduct: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  soldOutProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  avgCompletedOrderValue: number;
}

export interface SalesData {
  date: string;
  value: number;
}

export interface TopSeller {
  sellerId: string;
  sellerName: string;
  storeName: string;
  totalRevenue: number;
  totalOrders: number;
}

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [
    totalUser,
    totalCategory,
    totalSubcategory,
    totalProduct,
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    soldOutProducts,
    lowStockProducts,
    revenueData,
    avgOrderValue,
  ] = await Promise.all([
    Customer.countDocuments({ status: "Active" }),
    Category.countDocuments(),
    SubCategory.countDocuments(),
    Product.countDocuments({ status: "Active" }),
    Order.countDocuments(),
    Order.countDocuments({ status: "Delivered" }),
    Order.countDocuments({
      status: { $in: ["Received", "Pending", "Processed"] },
    }),
    Order.countDocuments({ status: "Cancelled" }),
    Product.countDocuments({ stock: 0, status: "Active" }),
    Product.countDocuments({ stock: { $lte: 10, $gt: 0 }, status: "Active" }),
    Order.aggregate([
      { $match: { status: "Delivered", paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { status: "Delivered", paymentStatus: "Paid" } },
      { $group: { _id: null, avg: { $avg: "$total" } } },
    ]),
  ]);

  const totalRevenue = revenueData[0]?.total || 0;
  const avgCompletedOrderValue = avgOrderValue[0]?.avg || 0;

  return {
    totalUser,
    totalCategory,
    totalSubcategory,
    totalProduct,
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    soldOutProducts,
    lowStockProducts,
    totalRevenue,
    avgCompletedOrderValue: Math.round(avgCompletedOrderValue * 100) / 100,
  };
};

/**
 * Get sales analytics data for charts
 */
export const getSalesAnalytics = async (
  period: "day" | "week" | "month" | "year" = "month"
): Promise<{ thisPeriod: SalesData[]; lastPeriod: SalesData[] }> => {
  const now = new Date();
  let startDate: Date;
  let lastPeriodStart: Date;
  let groupFormat: string;
  // let dateFormat: string;

  switch (period) {
    case "day":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      );
      lastPeriodStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 14
      );
      groupFormat = "%Y-%m-%d";
      // dateFormat = "DD-MMM";
      break;
    case "week":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      lastPeriodStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      groupFormat = "%Y-%U";
      // dateFormat = "Week %U";
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      lastPeriodStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      groupFormat = "%Y-%m";
      // dateFormat = "%B";
      break;
    case "year":
      startDate = new Date(now.getFullYear() - 4, 0, 1);
      lastPeriodStart = new Date(now.getFullYear() - 9, 0, 1);
      groupFormat = "%Y";
      // dateFormat = "%Y";
      break;
  }

  const [thisPeriodData, lastPeriodData] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          status: "Delivered",
          paymentStatus: "Paid",
          orderDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$orderDate" } },
          total: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      {
        $match: {
          status: "Delivered",
          paymentStatus: "Paid",
          orderDate: { $gte: lastPeriodStart, $lt: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$orderDate" } },
          total: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const thisPeriod = thisPeriodData.map((item) => ({
    date: item._id,
    value: item.total,
  }));

  const lastPeriod = lastPeriodData.map((item) => ({
    date: item._id,
    value: item.total,
  }));

  return { thisPeriod, lastPeriod };
};

/**
 * Get top sellers by revenue
 */
export const getTopSellers = async (
  limit: number = 10
): Promise<TopSeller[]> => {
  const topSellers = await Order.aggregate([
    {
      $match: {
        status: "Delivered",
        paymentStatus: "Paid",
      },
    },
    {
      $unwind: "$items",
    },
    {
      $lookup: {
        from: "orderitems",
        localField: "items",
        foreignField: "_id",
        as: "orderItem",
      },
    },
    {
      $unwind: "$orderItem",
    },
    {
      $group: {
        _id: "$orderItem.seller",
        totalRevenue: { $sum: "$orderItem.total" },
        totalOrders: { $sum: 1 },
      },
    },
    {
      $sort: { totalRevenue: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "sellers",
        localField: "_id",
        foreignField: "_id",
        as: "seller",
      },
    },
    {
      $unwind: "$seller",
    },
    {
      $project: {
        sellerId: "$_id",
        sellerName: "$seller.sellerName",
        storeName: "$seller.storeName",
        totalRevenue: 1,
        totalOrders: 1,
      },
    },
  ]);

  return topSellers;
};

/**
 * Get recent orders
 */
export const getRecentOrders = async (limit: number = 10) => {
  const orders = await Order.find()
    .populate("customer", "name email phone")
    .populate("deliveryBoy", "name mobile")
    .sort({ orderDate: -1 })
    .limit(limit)
    .lean();

  return orders.map((order) => ({
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    orderDate: order.orderDate,
    status: order.status,
    amount: order.total,
    deliveryBoy: order.deliveryBoy
      ? {
        name: (order.deliveryBoy as any).name,
        mobile: (order.deliveryBoy as any).mobile,
      }
      : null,
  }));
};

/**
 * Get sales by location
 */
export const getSalesByLocation = async () => {
  const salesByLocation = await Order.aggregate([
    {
      $match: {
        status: "Delivered",
        paymentStatus: "Paid",
      },
    },
    {
      $group: {
        _id: "$deliveryAddress.city",
        amount: { $sum: "$total" },
      },
    },
    {
      $sort: { amount: -1 },
    },
    {
      $project: {
        location: { $ifNull: ["$_id", "Unknown"] },
        amount: 1,
      },
    },
  ]);

  return salesByLocation;
};
