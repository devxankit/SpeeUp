import mongoose, { Document, Schema } from 'mongoose';

export interface IShop extends Document {
    name: string;
    image: string;
    description?: string;
    products: mongoose.Types.ObjectId[];
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
        image: {
            type: String,
            required: [true, 'Shop image is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        products: [{
            type: Schema.Types.ObjectId,
            ref: 'Product',
        }],
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
