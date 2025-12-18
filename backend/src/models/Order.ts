import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  // Basic Info
  orderId: string;
  invoiceNumber: string;

  // Relationships
  customerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  deliveryId?: mongoose.Types.ObjectId;

  // Dates
  orderDate: Date;
  deliveryDate: Date;
  timeSlot: string;

  // Status
  status: 'Pending' | 'Accepted' | 'On the way' | 'Delivered' | 'Cancelled' | 'Out For Delivery' | 'Received' | 'Payment Pending';

  // Financial
  subtotal: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';

  // Address (embedded)
  deliveryAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  itemCount?: number;
}

const OrderSchema = new Schema<IOrder>(
  {
    // Basic Info
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      unique: true,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      trim: true,
    },

    // Relationships
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
    deliveryId: {
      type: Schema.Types.ObjectId,
      ref: 'Delivery',
    },

    // Dates
    orderDate: {
      type: Date,
      required: [true, 'Order date is required'],
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Delivery date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
    },

    // Status
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'On the way', 'Delivered', 'Cancelled', 'Out For Delivery', 'Received', 'Payment Pending'],
      default: 'Pending',
    },

    // Financial
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      required: [true, 'Tax is required'],
      min: [0, 'Tax cannot be negative'],
    },
    grandTotal: {
      type: Number,
      required: [true, 'Grand total is required'],
      min: [0, 'Grand total cannot be negative'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },

    // Address (embedded)
    deliveryAddress: {
      name: {
        type: String,
        required: [true, 'Delivery name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Delivery phone is required'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Delivery address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Delivery city is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'Delivery state is required'],
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, 'Delivery pincode is required'],
        trim: true,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for item count
OrderSchema.virtual('itemCount', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'orderId',
  count: true,
});

// Indexes for better query performance
OrderSchema.index({ sellerId: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ sellerId: 1, orderDate: -1 });
OrderSchema.index({ sellerId: 1, status: 1 });

// Ensure virtuals are included in JSON output
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
  // Order Info
  orderNumber: string;
  orderDate: Date;

  // Customer Info
  customer: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Delivery Info
  deliveryAddress: {
    address: string;
    city: string;
    state?: string;
    pincode: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };

  // Order Items
  items: mongoose.Types.ObjectId[]; // References to OrderItem

  // Pricing
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;

  // Payment
  paymentMethod: string;
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";
  paymentId?: string;

  // Order Status
  status:
    | "Received"
    | "Pending"
    | "Processed"
    | "Shipped"
    | "Out for Delivery"
    | "Delivered"
    | "Cancelled"
    | "Returned";

  // Delivery Assignment
  deliveryBoy?: mongoose.Types.ObjectId;
  deliveryBoyStatus?:
    | "Assigned"
    | "Picked Up"
    | "In Transit"
    | "Delivered"
    | "Failed";
  assignedAt?: Date;

  // Tracking
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;

  // Notes
  adminNotes?: string;
  customerNotes?: string;

  // Cancellation/Return
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    // Order Info
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      trim: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },

    // Customer Info
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer is required"],
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
    },

    // Delivery Info
    deliveryAddress: {
      address: {
        type: String,
        required: [true, "Delivery address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
      },
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },

    // Order Items
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderItem",
      },
    ],

    // Pricing
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },
    shipping: {
      type: Number,
      default: 0,
      min: [0, "Shipping cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    couponCode: {
      type: String,
      trim: true,
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },

    // Payment
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentId: {
      type: String,
      trim: true,
    },

    // Order Status
    status: {
      type: String,
      enum: [
        "Received",
        "Pending",
        "Processed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Received",
    },

    // Delivery Assignment
    deliveryBoy: {
      type: Schema.Types.ObjectId,
      ref: "Delivery",
    },
    deliveryBoyStatus: {
      type: String,
      enum: ["Assigned", "Picked Up", "In Transit", "Delivered", "Failed"],
    },
    assignedAt: {
      type: Date,
    },

    // Tracking
    trackingNumber: {
      type: String,
      trim: true,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },

    // Notes
    adminNotes: {
      type: String,
      trim: true,
    },
    customerNotes: {
      type: String,
      trim: true,
    },

    // Cancellation/Return
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
OrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
});

// Indexes for faster queries
OrderSchema.index({ customer: 1, orderDate: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ deliveryBoy: 1 });
OrderSchema.index({ orderNumber: 1 });

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
