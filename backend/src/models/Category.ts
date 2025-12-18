

import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  image?: string;
  order: number;
  isBestseller: boolean;
  hasWarning: boolean;
  groupCategory?: string;
  totalSubcategories?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Order cannot be negative"],
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    hasWarning: {
      type: Boolean,
      default: false,
    },
    groupCategory: {
      type: String,
      trim: true,
    },
    totalSubcategories: {
      type: Number,
      default: 0,
      min: [0, "Total subcategories cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CategorySchema.index({ order: 1 });
CategorySchema.index({ name: 1 });

const Category = mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
