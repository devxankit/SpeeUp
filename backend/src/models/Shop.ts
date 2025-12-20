import mongoose, { Document, Schema } from "mongoose";

export interface IShop extends Document {
  name: string;
  image: string;
  description?: string;
  slug?: string;
  bgColor?: string;
  order?: number;
  products: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Shop image is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    bgColor: {
      type: String,
      trim: true,
      default: "bg-neutral-50",
    },
    order: {
      type: Number,
      default: 0,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name if not provided
ShopSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

const Shop = mongoose.model<IShop>("Shop", ShopSchema);

export default Shop;
