import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariation {
  title: string;
  price: number;
  discPrice: number;
  stock: number; // 0 means unlimited
  status: 'Available' | 'Sold out';
  sku?: string;
}

export interface IProduct extends Document {
  // Basic Info
  productName: string;
  sellerId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  subcategoryId?: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;

  // Status Flags
  publish: boolean;
  popular: boolean;
  dealOfDay: boolean;

  // SEO
  seoTitle?: string;
  seoKeywords?: string;
  seoImageAlt?: string;
  seoDescription?: string;

  // Details
  smallDescription?: string;
  tags: string[];
  manufacturer?: string;
  madeIn?: string;
  taxId?: mongoose.Types.ObjectId;

  // Return Policy
  isReturnable: boolean;
  maxReturnDays?: number;

  // Quantity & Compliance
  totalAllowedQuantity: number;
  fssaiLicNo?: string;

  // Images
  mainImageUrl?: string;
  galleryImageUrls: string[];

  // Variations
  variations: IProductVariation[];

  // Variation Type
  variationType?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ProductVariationSchema = new Schema<IProductVariation>(
  {
    title: {
      type: String,
      required: [true, 'Variation title is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discPrice: {
      type: Number,
      default: 0,
      min: [0, 'Discounted price cannot be negative'],
      validate: {
        validator: function (this: IProductVariation, value: number) {
          return value <= this.price;
        },
        message: 'Discounted price must be less than or equal to price',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0, // 0 means unlimited
    },
    status: {
      type: String,
      enum: ['Available', 'Sold out'],
      default: 'Available',
    },
    sku: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const ProductSchema = new Schema<IProduct>(
  {
    // Basic Info
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: [true, 'Seller ID is required'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    subcategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },

    // Status Flags
    publish: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    dealOfDay: {
      type: Boolean,
      default: false,
    },

    // SEO
    seoTitle: {
      type: String,
      trim: true,
    },
    seoKeywords: {
      type: String,
      trim: true,
    },
    seoImageAlt: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },

    // Details
    smallDescription: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    madeIn: {
      type: String,
      trim: true,
    },
    taxId: {
      type: Schema.Types.ObjectId,
      ref: 'Tax',
    },

    // Return Policy
    isReturnable: {
      type: Boolean,
      default: false,
    },
    maxReturnDays: {
      type: Number,
      min: [0, 'Max return days cannot be negative'],
    },

    // Quantity & Compliance
    totalAllowedQuantity: {
      type: Number,
      required: [true, 'Total allowed quantity is required'],
      min: [1, 'Total allowed quantity must be at least 1'],
      default: 10,
    },
    fssaiLicNo: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Optional field
          return /^[0-9]{14}$/.test(v);
        },
        message: 'FSSAI license number must be 14 digits',
      },
    },

    // Images
    mainImageUrl: {
      type: String,
      trim: true,
    },
    galleryImageUrls: {
      type: [String],
      default: [],
    },

    // Variations
    variations: {
      type: [ProductVariationSchema],
      required: [true, 'At least one variation is required'],
      validate: {
        validator: function (v: IProductVariation[]) {
          return v.length > 0;
        },
        message: 'Product must have at least one variation',
      },
    },

    // Variation Type
    variationType: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ProductSchema.index({ sellerId: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ subcategoryId: 1 });
ProductSchema.index({ brandId: 1 });
ProductSchema.index({ publish: 1 });
ProductSchema.index({ popular: 1 });
ProductSchema.index({ dealOfDay: 1 });
ProductSchema.index({ productName: 'text', smallDescription: 'text', tags: 'text' });

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;


import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  // Basic Info
  productName: string;
  smallDescription?: string;
  description?: string;

  // Categorization
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  brand?: mongoose.Types.ObjectId;

  // Seller Info
  seller: mongoose.Types.ObjectId;

  // Images
  mainImage?: string;
  galleryImages: string[];

  // Pricing & Inventory
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
  barcode?: string;

  // Variations
  variationType?: string; // e.g., 'Size', 'Color', 'Weight'
  variations?: Array<{
    name: string;
    value: string;
    price?: number;
    stock?: number;
    sku?: string;
  }>;

  // Status Flags
  publish: boolean;
  popular: boolean;
  dealOfDay: boolean;
  status: "Active" | "Inactive" | "Pending" | "Rejected";

  // Product Details
  manufacturer?: string;
  madeIn?: string;
  tax?: string;
  fssaiLicNo?: string;
  totalAllowedQuantity?: number;

  // Return Policy
  isReturnable: boolean;
  maxReturnDays?: number;

  // SEO
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  seoImageAlt?: string;

  // Tags
  tags: string[];

  // Approval
  requiresApproval: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;

  // Commission
  commission?: number;

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    // Basic Info
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    smallDescription: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // Categorization
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },

    // Seller Info
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "Seller is required"],
    },

    // Images
    mainImage: {
      type: String,
      trim: true,
    },
    galleryImages: {
      type: [String],
      default: [],
    },

    // Pricing & Inventory
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Compare at price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    barcode: {
      type: String,
      trim: true,
    },

    // Variations
    variationType: {
      type: String,
      trim: true,
    },
    variations: {
      type: [
        {
          name: String,
          value: String,
          price: Number,
          stock: Number,
          sku: String,
        },
      ],
      default: [],
    },

    // Status Flags
    publish: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    dealOfDay: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending", "Rejected"],
      default: "Pending",
    },

    // Product Details
    manufacturer: {
      type: String,
      trim: true,
    },
    madeIn: {
      type: String,
      trim: true,
    },
    tax: {
      type: String,
      trim: true,
    },
    fssaiLicNo: {
      type: String,
      trim: true,
    },
    totalAllowedQuantity: {
      type: Number,
      min: [0, "Total allowed quantity cannot be negative"],
    },

    // Return Policy
    isReturnable: {
      type: Boolean,
      default: false,
    },
    maxReturnDays: {
      type: Number,
      min: [0, "Max return days cannot be negative"],
    },

    // SEO
    seoTitle: {
      type: String,
      trim: true,
    },
    seoKeywords: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    seoImageAlt: {
      type: String,
      trim: true,
    },

    // Tags
    tags: {
      type: [String],
      default: [],
    },

    // Approval
    requiresApproval: {
      type: Boolean,
      default: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedAt: {
      type: Date,
    },

    // Commission
    commission: {
      type: Number,
      min: [0, "Commission cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ProductSchema.index({ seller: 1, status: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ subcategory: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ publish: 1 });
ProductSchema.index({
  productName: "text",
  smallDescription: "text",
  description: "text",
});

const Product = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
