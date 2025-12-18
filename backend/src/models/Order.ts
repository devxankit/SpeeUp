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
