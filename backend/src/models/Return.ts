import mongoose, { Document, Schema } from 'mongoose';

export interface IReturn extends Document {
  // Relationships
  orderId: mongoose.Types.ObjectId;
  orderItemId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;

  // Product details
  productName: string;
  variantTitle: string;

  // Pricing
  price: number;
  discPrice: number;
  quantity: number;
  total: number;

  // Status
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';

  // Dates
  returnDate: Date;
  processedDate?: Date;

  // Reason
  reason?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ReturnSchema = new Schema<IReturn>(
  {
    // Relationships
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },
    orderItemId: {
      type: Schema.Types.ObjectId,
      ref: 'OrderItem',
      required: [true, 'Order Item ID is required'],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: [true, 'Seller ID is required'],
    },

    // Product details
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    variantTitle: {
      type: String,
      required: [true, 'Variant title is required'],
      trim: true,
    },

    // Pricing
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discPrice: {
      type: Number,
      required: [true, 'Discounted price is required'],
      min: [0, 'Discounted price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },

    // Status
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
      default: 'Pending',
    },

    // Dates
    returnDate: {
      type: Date,
      required: [true, 'Return date is required'],
    },
    processedDate: {
      type: Date,
    },

    // Reason
    reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ReturnSchema.index({ sellerId: 1 });
ReturnSchema.index({ orderId: 1 });
ReturnSchema.index({ status: 1 });
ReturnSchema.index({ returnDate: -1 });
ReturnSchema.index({ sellerId: 1, status: 1 });
ReturnSchema.index({ sellerId: 1, returnDate: -1 });
ReturnSchema.index({ sellerId: 1, status: 1, returnDate: -1 });

const Return = mongoose.model<IReturn>('Return', ReturnSchema);

export default Return;

import mongoose, { Document, Schema } from "mongoose";

export interface IReturn extends Document {
  order: mongoose.Types.ObjectId;
  orderItem: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;

  // Return Info
  reason: string;
  description?: string;
  status: "Pending" | "Approved" | "Rejected" | "Processing" | "Completed";

  // Items
  quantity: number;
  images?: string[]; // Images of returned items

  // Processing
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  rejectionReason?: string;

  // Pickup
  pickupScheduled?: Date;
  pickupCompleted?: Date;
  pickupAddress?: {
    address: string;
    city: string;
    pincode: string;
  };

  // Refund
  refundAmount?: number;
  refundId?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ReturnSchema = new Schema<IReturn>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required"],
    },
    orderItem: {
      type: Schema.Types.ObjectId,
      ref: "OrderItem",
      required: [true, "Order item is required"],
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer is required"],
    },

    // Return Info
    reason: {
      type: String,
      required: [true, "Return reason is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Processing", "Completed"],
      default: "Pending",
    },

    // Items
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    images: {
      type: [String],
      default: [],
    },

    // Processing
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    processedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },

    // Pickup
    pickupScheduled: {
      type: Date,
    },
    pickupCompleted: {
      type: Date,
    },
    pickupAddress: {
      address: String,
      city: String,
      pincode: String,
    },

    // Refund
    refundAmount: {
      type: Number,
      min: [0, "Refund amount cannot be negative"],
    },
    refundId: {
      type: Schema.Types.ObjectId,
      ref: "Refund",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReturnSchema.index({ order: 1 });
ReturnSchema.index({ customer: 1 });
ReturnSchema.index({ status: 1 });

const Return = mongoose.model<IReturn>("Return", ReturnSchema);

export default Return;
