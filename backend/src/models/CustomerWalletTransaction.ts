
import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomerWalletTransaction extends Document {
    customerId: mongoose.Types.ObjectId;
    amount: number;
    type: 'Credit' | 'Debit';
    description: string;
    status: 'Completed' | 'Pending' | 'Failed';
    reference: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerWalletTransactionSchema = new Schema<ICustomerWalletTransaction>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer ID is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        type: {
            type: String,
            enum: ['Credit', 'Debit'],
            required: [true, 'Transaction type is required'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['Completed', 'Pending', 'Failed'],
            default: 'Completed',
        },
        reference: {
            type: String,
            unique: true,
            required: [true, 'Reference ID is required'],
        },
        metadata: {
            type: Map,
            of: Schema.Types.Mixed,
        }
    },
    {
        timestamps: true,
    }
);

CustomerWalletTransactionSchema.index({ customerId: 1 });
CustomerWalletTransactionSchema.index({ createdAt: -1 });

const CustomerWalletTransaction = mongoose.model<ICustomerWalletTransaction>('CustomerWalletTransaction', CustomerWalletTransactionSchema);

export default CustomerWalletTransaction;
