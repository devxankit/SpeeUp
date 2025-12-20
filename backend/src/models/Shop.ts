import mongoose, { Document, Schema } from 'mongoose';

export interface IShop extends Document {
    name: string;
    storeId: string; // slug/identifier for the store
    image: string;
    description?: string;
    category?: mongoose.Types.ObjectId; // Reference to Category
    subCategory?: mongoose.Types.ObjectId; // Reference to SubCategory
    products: mongoose.Types.ObjectId[];
    order: number; // For sorting/ordering
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
    {
        name: {
            type: String,
            required: [true, 'Shop name is required'],
            trim: true,
        },
        storeId: {
            type: String,
            required: [true, 'Store ID is required'],
            trim: true,
            unique: true,
            lowercase: true,
        },
        image: {
            type: String,
            required: [true, 'Shop image is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
        },
        subCategory: {
            type: Schema.Types.ObjectId,
            ref: 'SubCategory',
        },
        products: [{
            type: Schema.Types.ObjectId,
            ref: 'Product',
        }],
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Shop = mongoose.model<IShop>('Shop', ShopSchema);

export default Shop;
