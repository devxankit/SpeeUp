import Customer from '../models/Customer';
import CustomerWalletTransaction from '../models/CustomerWalletTransaction';
import mongoose from 'mongoose';

/**
 * Generate a unique transaction reference ID
 */
function generateTransactionReference(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN-${timestamp}-${random}`.toUpperCase();
}

/**
 * Check if customer has sufficient wallet balance
 */
export async function checkWalletBalance(
    customerId: string,
    amount: number
): Promise<{ sufficient: boolean; balance: number }> {
    const customer = await Customer.findById(customerId).select('walletAmount');

    if (!customer) {
        return { sufficient: false, balance: 0 };
    }

    return {
        sufficient: customer.walletAmount >= amount,
        balance: customer.walletAmount,
    };
}

/**
 * Deduct amount from customer wallet for order payment
 */
export async function deductWalletForOrder(
    customerId: string,
    amount: number,
    orderId: string,
    orderNumber: string,
    session?: mongoose.ClientSession
): Promise<{
    success: boolean;
    message: string;
    transactionId?: string;
    newBalance?: number;
}> {
    try {
        // Get customer and check balance
        const customer = await Customer.findById(customerId).session(session || null);

        if (!customer) {
            return { success: false, message: 'Customer not found' };
        }

        if (customer.walletAmount < amount) {
            return {
                success: false,
                message: `Insufficient wallet balance. Available: ₹${customer.walletAmount.toFixed(2)}, Required: ₹${amount.toFixed(2)}`,
            };
        }

        // Generate transaction reference
        const reference = generateTransactionReference();

        // Create wallet transaction record
        const transaction = new CustomerWalletTransaction({
            customerId: new mongoose.Types.ObjectId(customerId),
            amount,
            type: 'Debit',
            description: `Payment for Order #${orderNumber}`,
            status: 'Completed',
            reference,
            metadata: {
                orderId,
                orderNumber,
                paymentType: 'Order Payment',
            },
        });

        if (session) {
            await transaction.save({ session });
        } else {
            await transaction.save();
        }

        // Deduct from customer wallet
        const updateOptions = session ? { session } : {};
        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            {
                $inc: { walletAmount: -amount },
            },
            { new: true, ...updateOptions }
        );

        if (!updatedCustomer) {
            return { success: false, message: 'Failed to update wallet balance' };
        }

        console.log(`💳 Wallet deducted: ₹${amount} from customer ${customerId} for order ${orderNumber}`);

        return {
            success: true,
            message: 'Payment successful',
            transactionId: reference,
            newBalance: updatedCustomer.walletAmount,
        };
    } catch (error) {
        console.error('Error deducting wallet:', error);
        return { success: false, message: 'Failed to process wallet payment' };
    }
}

/**
 * Refund amount to customer wallet (for cancelled orders, returns, etc.)
 */
export async function refundToWallet(
    customerId: string,
    amount: number,
    orderId: string,
    orderNumber: string,
    reason: string = 'Order Refund',
    session?: mongoose.ClientSession
): Promise<{
    success: boolean;
    message: string;
    transactionId?: string;
    newBalance?: number;
}> {
    try {
        // Generate transaction reference
        const reference = generateTransactionReference();

        // Create wallet transaction record
        const transaction = new CustomerWalletTransaction({
            customerId: new mongoose.Types.ObjectId(customerId),
            amount,
            type: 'Credit',
            description: `${reason} - Order #${orderNumber}`,
            status: 'Completed',
            reference,
            metadata: {
                orderId,
                orderNumber,
                refundReason: reason,
            },
        });

        if (session) {
            await transaction.save({ session });
        } else {
            await transaction.save();
        }

        // Add to customer wallet
        const updateOptions = session ? { session } : {};
        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            {
                $inc: { walletAmount: amount },
            },
            { new: true, ...updateOptions }
        );

        if (!updatedCustomer) {
            return { success: false, message: 'Failed to update wallet balance' };
        }

        console.log(`💳 Wallet credited: ₹${amount} to customer ${customerId} for order ${orderNumber}`);

        return {
            success: true,
            message: 'Refund successful',
            transactionId: reference,
            newBalance: updatedCustomer.walletAmount,
        };
    } catch (error) {
        console.error('Error refunding to wallet:', error);
        return { success: false, message: 'Failed to process refund' };
    }
}

/**
 * Add funds to customer wallet (top-up)
 */
export async function addFundsToWallet(
    customerId: string,
    amount: number,
    paymentReference: string,
    paymentMethod: string = 'Online',
    session?: mongoose.ClientSession
): Promise<{
    success: boolean;
    message: string;
    transactionId?: string;
    newBalance?: number;
}> {
    try {
        // Generate transaction reference
        const reference = generateTransactionReference();

        // Create wallet transaction record
        const transaction = new CustomerWalletTransaction({
            customerId: new mongoose.Types.ObjectId(customerId),
            amount,
            type: 'Credit',
            description: `Wallet Top-up via ${paymentMethod}`,
            status: 'Completed',
            reference,
            metadata: {
                paymentReference,
                paymentMethod,
            },
        });

        if (session) {
            await transaction.save({ session });
        } else {
            await transaction.save();
        }

        // Add to customer wallet
        const updateOptions = session ? { session } : {};
        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            {
                $inc: { walletAmount: amount },
            },
            { new: true, ...updateOptions }
        );

        if (!updatedCustomer) {
            return { success: false, message: 'Failed to update wallet balance' };
        }

        console.log(`💳 Wallet top-up: ₹${amount} added to customer ${customerId}`);

        return {
            success: true,
            message: 'Funds added successfully',
            transactionId: reference,
            newBalance: updatedCustomer.walletAmount,
        };
    } catch (error) {
        console.error('Error adding funds to wallet:', error);
        return { success: false, message: 'Failed to add funds' };
    }
}
