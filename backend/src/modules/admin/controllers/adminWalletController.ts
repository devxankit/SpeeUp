import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import Seller from "../../../models/Seller";
import Customer from "../../../models/Customer";
import Order from "../../../models/Order";
import Payment from "../../../models/Payment";
import Commission from "../../../models/Commission";

/**
 * Get wallet transactions
 */
export const getWalletTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      type, // 'seller' | 'customer'
      userId,
      // transactionType, // 'credit' | 'debit'
      transactionType: _transactionType, // 'credit' | 'debit'
    } = req.query;

    // This is a simplified version - in a real app, you'd have a Transaction model
    // For now, we'll return orders and payments as transactions

    const query: any = {};
    if (type === "customer" && userId) {
      query.customer = userId;
    } else if (type === "seller" && userId) {
      // Get seller's orders through order items
      const orders = await Order.find().populate({
        path: "items",
        match: { seller: userId },
      });
      query._id = { $in: orders.map((o) => o._id) };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("order")
        .populate("customer", "name email")
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      Payment.countDocuments(query),
    ]);

    const transactions = payments.map((payment) => ({
      id: payment._id,
      type: "payment",
      amount: payment.amount,
      transactionType: payment.status === "Completed" ? "debit" : "pending",
      description: `Order ${(payment.order as any)?.orderNumber || "N/A"}`,
      date: payment.paymentDate,
      status: payment.status,
    }));

    return res.status(200).json({
      success: true,
      message: "Wallet transactions fetched successfully",
      data: transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  }
);

/**
 * Process fund transfer
 */
export const processFundTransfer = asyncHandler(
  async (req: Request, res: Response) => {
    const { fromType, fromId, toType, toId, amount, reason } = req.body;

    if (!fromType || !fromId || !toType || !toId || !amount) {
      return res.status(400).json({
        success: false,
        message: "From type, from ID, to type, to ID, and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Get from account
    let fromAccount: any;
    if (fromType === "seller") {
      fromAccount = await Seller.findById(fromId);
    } else if (fromType === "customer") {
      fromAccount = await Customer.findById(fromId);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid from type. Must be seller or customer",
      });
    }

    if (!fromAccount) {
      return res.status(404).json({
        success: false,
        message: "From account not found",
      });
    }

    // Check balance
    const balanceField = fromType === "seller" ? "balance" : "walletAmount";
    if (fromAccount[balanceField] < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Get to account
    let toAccount: any;
    if (toType === "seller") {
      toAccount = await Seller.findById(toId);
    } else if (toType === "customer") {
      toAccount = await Customer.findById(toId);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid to type. Must be seller or customer",
      });
    }

    if (!toAccount) {
      return res.status(404).json({
        success: false,
        message: "To account not found",
      });
    }

    // Process transfer
    fromAccount[balanceField] -= amount;
    const toBalanceField = toType === "seller" ? "balance" : "walletAmount";
    toAccount[toBalanceField] += amount;

    await Promise.all([fromAccount.save(), toAccount.save()]);

    return res.status(200).json({
      success: true,
      message: "Fund transfer completed successfully",
      data: {
        from: {
          type: fromType,
          id: fromId,
          previousBalance: fromAccount[balanceField] + amount,
          newBalance: fromAccount[balanceField],
        },
        to: {
          type: toType,
          id: toId,
          previousBalance: toAccount[toBalanceField] - amount,
          newBalance: toAccount[toBalanceField],
        },
        amount,
        reason,
      },
    });
  }
);

/**
 * Get seller transactions
 */
export const getSellerTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get commissions
    const [commissions, commissionTotal] = await Promise.all([
      Commission.find({ seller: sellerId })
        .populate("order")
        .populate("orderItem")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      Commission.countDocuments({ seller: sellerId }),
    ]);

    const transactions = commissions.map((commission) => ({
      id: commission._id,
      type: "commission",
      amount: commission.commissionAmount,
      transactionType: commission.status === "Paid" ? "credit" : "pending",
      description: `Commission for Order ${(commission.order as any)?.orderNumber || "N/A"
        }`,
      date: commission.createdAt,
      status: commission.status,
    }));

    return res.status(200).json({
      success: true,
      message: "Seller transactions fetched successfully",
      data: transactions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: commissionTotal,
        pages: Math.ceil(commissionTotal / parseInt(limit as string)),
      },
    });
  }
);

/**
 * Process withdrawal request
 */
export const processWithdrawal = asyncHandler(
  async (req: Request, res: Response) => {
    const { sellerId, amount, paymentReference, notes } = req.body;

    if (!sellerId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Seller ID and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Deduct from seller balance
    seller.balance -= amount;
    await seller.save();

    // Update pending commissions to paid
    await Commission.updateMany(
      { seller: sellerId, status: "Pending" },
      {
        status: "Paid",
        paidAt: new Date(),
        paymentReference,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Withdrawal processed successfully",
      data: {
        seller: seller.toObject(),
        transaction: {
          amount,
          paymentReference,
          notes,
          previousBalance: seller.balance + amount,
          newBalance: seller.balance,
        },
      },
    });
  }
);
