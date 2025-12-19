
import { Request, Response } from 'express';
import Customer from '../../../models/Customer';
import CustomerWalletTransaction from '../../../models/CustomerWalletTransaction';

export const getWalletStats = async (req: Request, res: Response) => {
    try {
        const customerId = req.user?.userId;
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                balance: customer.walletAmount,
                currency: 'INR'
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching wallet stats',
            error: error.message
        });
    }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const customerId = req.user?.userId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const transactions = await CustomerWalletTransaction.find({ customerId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await CustomerWalletTransaction.countDocuments({ customerId });

        return res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching transactions',
            error: error.message
        });
    }
};
