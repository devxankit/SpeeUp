import { Request, Response } from "express";
import Category from "../../../models/Category";
import SubCategory from "../../../models/SubCategory";
import mongoose from "mongoose";

// Get all categories (public)
export const getCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await Category.find({
            status: "Active" // Only return active categories
        })
            .sort({ order: 1 })
            .select("name image icon description color slug _id");

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message,
        });
    }
};

// Get all categories with their subcategories (for menu/sidebar)
export const getCategoriesWithSubs = async (_req: Request, res: Response) => {
    try {
        const categories = await Category.find()
            .sort({ order: 1 })
            .lean();

        const categoriesWithSubs = await Promise.all(
            categories.map(async (category) => {
                const subcategories = await SubCategory.find({
                    category: category._id,
                })
                    .sort({ order: 1 })
                    .select("name image order");
                return {
                    ...category,
                    subcategories,
                };
            })
        );

        return res.status(200).json({
            success: true,
            data: categoriesWithSubs,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error fetching categories tree",
            error: error.message,
        });
    }
};

// Get single category details with subcategories
export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(`[getCategoryById] Looking for category with id/slug: ${id}`);
        let category;

        // Try to find by ObjectId first (only active categories for public endpoint)
        if (mongoose.Types.ObjectId.isValid(id)) {
            category = await Category.findOne({ 
                _id: id,
                status: "Active" 
            }).lean();
        }
        
        // If not found by ID, try by slug (case-insensitive, only active categories)
        if (!category) {
            // Try exact slug match first
            category = await Category.findOne({ 
                slug: id,
                status: "Active"
            }).lean();
            
            // Try case-insensitive slug match
            if (!category) {
                category = await Category.findOne({ 
                    slug: { $regex: new RegExp(`^${id}$`, 'i') },
                    status: "Active"
                }).lean();
            }
            
            // Try name match as fallback (case-insensitive)
            if (!category) {
                category = await Category.findOne({ 
                    name: { $regex: new RegExp(`^${id.replace(/[-_]/g, ' ')}$`, 'i') },
                    status: "Active"
                }).lean();
            }
        }

        if (!category) {
            // Check if it's a subcategory
            if (mongoose.Types.ObjectId.isValid(id)) {
                const subcategory = await SubCategory.findById(id).lean();
                if (subcategory) {
                    // Find the parent category
                    category = await Category.findById(subcategory.category).lean();
                    if (category) {
                        // Return both for the frontend to decide
                        const subcategories = await SubCategory.find({ category: category._id }).sort({
                            order: 1,
                        });
                        return res.status(200).json({
                            success: true,
                            data: {
                                category,
                                subcategories,
                                currentSubcategory: subcategory
                            },
                        });
                    }
                }
            }

            console.log(`[getCategoryById] Category not found: ${id}`);
            return res.status(404).json({
                success: false,
                message: `Category not found: ${id}`,
            });
        }
        
        console.log(`[getCategoryById] Found category: ${category.name} (${category._id})`);

        const subcategories = await SubCategory.find({ category: category._id }).sort({
            order: 1,
        });

        return res.status(200).json({
            success: true,
            data: {
                category,
                subcategories,
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error fetching category details",
            error: error.message,
        });
    }
};
