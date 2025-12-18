import mongoose, { Document, Schema } from 'mongoose';

export interface ITax extends Document {
    name: string;
    rate: number; // Percentage
    type: 'GST' | 'VAT' | 'Sales Tax' | 'Other';
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TaxSchema = new Schema<ITax>(
    {
        name: {
            type: String,
            required: [true, 'Tax name is required'],
            trim: true,
            unique: true,
        },
        rate: {
            type: Number,
            required: [true, 'Tax rate is required'],
            min: [0, 'Rate cannot be negative'],
        },
        type: {
            type: String,
            enum: ['GST', 'VAT', 'Sales Tax', 'Other'],
            default: 'GST',
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Tax = mongoose.model<ITax>('Tax', TaxSchema);

export default Tax;
