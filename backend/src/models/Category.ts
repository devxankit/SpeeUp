

import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
  order: number;
  isBestseller: boolean;
  hasWarning: boolean;
  groupCategory?: string;
  totalSubcategories?: number;
  status: "Active" | "Inactive";
  parentId?: mongoose.Types.ObjectId;
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
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
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
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CategorySchema.index({ order: 1 });
CategorySchema.index({ order: 1 });
CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ status: 1 });


const Category = mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
