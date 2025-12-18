import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem extends Document {
  // Relationships
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;

  // Product details
  productName: string;
  variantTitle: string;

  // Pricing
  unitPrice: number;
  discountedPrice: number;
  tax: number;
  taxPercent: number;
  quantity: number;
  subtotal: number;

  // Seller info
  soldBy: string;

  // Unit
  unit: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    // Relationships
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
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
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    discountedPrice: {
      type: Number,
      required: [true, 'Discounted price is required'],
      min: [0, 'Discounted price cannot be negative'],
    },
    tax: {
      type: Number,
      required: [true, 'Tax is required'],
      min: [0, 'Tax cannot be negative'],
    },
    taxPercent: {
      type: Number,
      required: [true, 'Tax percent is required'],
      min: [0, 'Tax percent cannot be negative'],
      max: [100, 'Tax percent cannot exceed 100'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },

    // Seller info
    soldBy: {
      type: String,
      required: [true, 'Sold by is required'],
      trim: true,
    },

    // Unit
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
OrderItemSchema.index({ orderId: 1 });
OrderItemSchema.index({ productId: 1 });
OrderItemSchema.index({ sellerId: 1 });
OrderItemSchema.index({ orderId: 1, productId: 1 });

// Compound indexes for common queries
OrderItemSchema.index({ sellerId: 1, orderId: 1 });
OrderItemSchema.index({ sellerId: 1, createdAt: -1 });

const OrderItem = mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);

export default OrderItem;

import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem extends Document {
  order: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;

  // Product Details (snapshot at time of order)
  productName: string;
  productImage?: string;
  sku?: string;

  // Pricing
  unitPrice: number;
  quantity: number;
  total: number;

  // Variation
  variation?: string;

  // Status
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled" | "Returned";

  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Seller is required"],
    },

    // Product Details (snapshot)
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productImage: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },

    // Pricing
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },

    // Variation
    variation: {
      type: String,
      trim: true,
    },

    // Status
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Returned"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
OrderItemSchema.index({ order: 1 });
OrderItemSchema.index({ product: 1 });
OrderItemSchema.index({ seller: 1 });

const OrderItem = mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);

export default OrderItem;
