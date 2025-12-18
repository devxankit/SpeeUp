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

import { Schema, model, Document } from "mongoose";

export interface ITax extends Document {
    name: string;
    percentage: number;
    status: "Active" | "Inactive";
    createdAt: Date;
    updatedAt: Date;
}

const taxSchema = new Schema<ITax>(
    {
        name: {
            type: String,
            required: [true, "Tax name is required"],
            trim: true,
            unique: true,
        },
        percentage: {
            type: Number,
            required: [true, "Tax percentage is required"],
            min: [0, "Tax percentage cannot be negative"],
            max: [100, "Tax percentage cannot exceed 100"],
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
taxSchema.index({ status: 1 });
taxSchema.index({ name: 1 });

const Tax = model<ITax>("Tax", taxSchema);

export default Tax;
