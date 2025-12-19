import mongoose, { Document, Schema } from "mongoose";

export interface IDeliveryTracking extends Document {
  order: mongoose.Types.ObjectId;
  deliveryBoy: mongoose.Types.ObjectId;

  // Location Tracking
  latitude: number;
  longitude: number;
  address?: string;

  // Status
  status: string;
  notes?: string;

  createdAt: Date;
}

const DeliveryTrackingSchema = new Schema<IDeliveryTracking>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required"],
    },
    deliveryBoy: {
      type: Schema.Types.ObjectId,
      ref: "Delivery",
      required: [true, "Delivery boy is required"],
    },

    // Location Tracking
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
    },
    address: {
      type: String,
      trim: true,
    },

    // Status
    status: {
      type: String,
      required: [true, "Status is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DeliveryTrackingSchema.index({ order: 1, createdAt: -1 });
DeliveryTrackingSchema.index({ deliveryBoy: 1 });

const DeliveryTracking = mongoose.model<IDeliveryTracking>(
  "DeliveryTracking",
  DeliveryTrackingSchema
);

export default DeliveryTracking;
