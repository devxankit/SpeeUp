import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  // Basic Info
  name: string;
  imageUrl?: string;

  // Hierarchy
  parentId?: mongoose.Types.ObjectId; // For subcategories, references parent category

  // Metadata
  isBestseller: boolean;
  hasWarning: boolean;
  groupCategory?: string;

  // Virtual fields (computed)
  totalSubcategory?: number;
  totalProduct?: number;

  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      index: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },

    // Hierarchy
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },

    // Metadata
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
  },
  {
    timestamps: true,
  }
);

// Virtual for subcategory count
CategorySchema.virtual('subcategoryCount', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
  count: true,
});

// Virtual for product count
CategorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId',
  count: true,
});

// Ensure virtuals are included in JSON output
CategorySchema.set('toJSON', { virtuals: true });
CategorySchema.set('toObject', { virtuals: true });

// Indexes for better query performance
CategorySchema.index({ name: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ name: 'text' });

const Category = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;

