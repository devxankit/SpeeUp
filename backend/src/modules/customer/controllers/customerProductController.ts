import { Request, Response } from "express";
import Product from "../../../models/Product";
import Category from "../../../models/Category";
import SubCategory from "../../../models/SubCategory";
import mongoose from "mongoose";

// Get products with filtering options (public)
export const getProducts = async (req: Request, res: Response) => {
    try {
        const {
            category,
            subcategory,
            search,
            page = 1,
            limit = 20,
            sort,
            minPrice,
            maxPrice,
            brand,
            minDiscount,
        } = req.query;


        const query: any = {
            status: "Active",
            publish: true,
        };

        // Helper to resolve category/subcategory ID from slug or ID
        const resolveId = async (model: any, value: string) => {
            if (mongoose.Types.ObjectId.isValid(value)) return value;
            const item = await model.findOne({ slug: value }).select("_id");
            return item ? item._id : null;
        };

        if (category) {
            const categoryId = await resolveId(Category, category as string);
            if (categoryId) query.category = categoryId;
        }

        if (subcategory) {
            const subcategoryId = await resolveId(SubCategory, subcategory as string);
            if (subcategoryId) query.subcategory = subcategoryId;
        }

        if (brand) {
            query.brand = brand;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (minDiscount) {
            query.discount = { $gte: Number(minDiscount) };
        }


        if (search) {
            // Use text search for broad matching
            query.$text = { $search: search as string };
        }

        // Calculate skip for pagination
        const skip = (Number(page) - 1) * Number(limit);

        // Build sort object
        let sortOptions: any = { createdAt: -1 }; // Default new to old
        if (sort === "price_asc") sortOptions = { price: 1 };
        if (sort === "price_desc") sortOptions = { price: -1 };
        if (sort === "discount") sortOptions = { discount: -1 };
        if (sort === "popular") sortOptions = { popular: -1, dealOfDay: -1 };


        const products = await Product.find(query)
            .populate("category", "name icon image")
            .populate("subcategory", "name")
            .populate("brand", "name")
            .populate("seller", "storeName")
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: error.message,
        });
    }
};

// Get single product by ID (public)
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findOne({
            _id: id,
            status: "Active",
            publish: true,
        })
            .populate("category", "name")
            .populate("subcategory", "name")
            .populate("brand", "name")
            .populate("seller", "storeName city fssaiLicNo address");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or unavailable",
            });
        }

        // Find similar products (by category)
        const similarProducts = await Product.find({
            category: (product.category as any)._id,
            _id: { $ne: product._id },
            status: "Active",
            publish: true,
        })
            .limit(6)
            .select("productName price mainImage pack discount");

        return res.status(200).json({
            success: true,
            data: {
                ...product.toObject(),
                similarProducts,
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error fetching product details",
            error: error.message,
        });
    }
};
