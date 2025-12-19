import { Request, Response } from "express";
import Product from "../../../models/Product";
import Category from "../../../models/Category";

// Get Home Page Content
export const getHomeContent = async (_req: Request, res: Response) => {
    try {
        // 1. Featured / Bestsellers (Top 10 popular products)
        const bestsellers = await Product.find({
            status: "Active",
            publish: true,
            popular: true
        })
            .limit(10)
            .select("productName price mainImage discount rating reviews pack");

        // 2. Categories for Tiles (Grocery, Snacks, etc)
        // We fetch all active categories and let frontend organize them, 
        // OR we return them grouped if specific groups are defined in DB.
        // For now, returning all suitable top-level categories.
        const categories = await Category.find({ status: "Active" })
            .select("name image icon color")
            .sort({ order: 1 });

        // 3. Shop By Store (Virtual categories)
        // In a real app, 'Stores' might be a separate model or a specific tag on products.
        // Here we define the static list that matches frontend hardcoded tiles, 
        // but typically this should come from a "Collections" or "Campaigns" DB.
        const shops = [
            { id: 'spiritual-store', name: 'Spiritual Store', image: '/assets/shopbystore/spiritual.jpg' },
            { id: 'pharma-store', name: 'Pharma Store', image: '/assets/shopbystore/pharma.jpg' },
            { id: 'e-gifts-store', name: 'E-Gifts Store', image: '/assets/shopbystore/egift.jpg' },
            { id: 'pet-store', name: 'Pet Store', image: '/assets/shopbystore/pet.jpg' },
            { id: 'fashion-basics-store', name: 'Fashion Store', image: '/assets/shopbystore/fashion.jpg' },
            { id: 'hobby-store', name: 'Hobby Store', image: '/assets/shopbystore/hobby.jpg' },
        ];

        res.status(200).json({
            success: true,
            data: {
                bestsellers,
                categories,
                shops,
                promoBanners: [
                    // Mock banners could go here
                    { id: 1, image: '/assets/banners/promo1.jpg', link: '/category/deals' }
                ],
                trending: [
                    // Mock trending categories matching frontend structure
                    { id: 'hair-spray', name: 'Hair Spray', image: '/assets/trending/hair-spray.jpg' },
                    { id: 'maybelline', name: 'Maybelline Lipstick', image: '/assets/trending/lipstick.jpg' },
                    { id: 'peanut-chikki', name: 'Peanut Chikki', image: '/assets/trending/chikki.jpg' },
                    { id: 'hair-straightener', name: 'Hair Straightener', image: '/assets/trending/straightener.jpg' },
                    { id: 'facial-kit', name: 'Facial Kit', image: '/assets/trending/facial.jpg' }
                ],
                cookingIdeas: [
                    // Mock cooking ideas
                    { id: 1, name: 'Paneer Masala', image: '/assets/cooking/paneer.jpg', link: '/recipe/paneer' },
                    { id: 2, name: 'Chicken Curry', image: '/assets/cooking/chicken.jpg', link: '/recipe/chicken' },
                    { id: 3, name: 'Veg Biryani', image: '/assets/cooking/biryani.jpg', link: '/recipe/biryani' }
                ]
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error fetching home content",
            error: error.message,
        });
    }
};

// Get Products for a specific "Store" (Campaign/Collection)
// This maps the virtual store IDs (e.g., 'faith-store') to actual product queries
export const getStoreProducts = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;
        let query: any = { status: "Active", publish: true };

        // Map store IDs to queries
        switch (storeId) {
            case 'spiritual-store':
                query.category = await getCategoryIdByName('Spiritual');
                break;
            case 'pharma-store':
                query.category = await getCategoryIdByName('Pharma');
                break;
            case 'e-gifts-store':
                query.category = await getCategoryIdByName('E-Gifts');
                break;
            case 'pet-store':
                query.category = await getCategoryIdByName('Pet Supplies');
                break;
            case 'fashion-basics-store':
                // Could be multiple categories
                query.$or = [
                    { category: await getCategoryIdByName('Fashion') },
                    { category: await getCategoryIdByName('Clothing') }
                ];
                break;
            case 'hobby-store':
                query.category = await getCategoryIdByName('Hobbies');
                break;
            default:
                // If it looks like a category ID, try that
                // query.category = storeId; 
                break;
        }

        if (query.category || query.$or) {
            const products = await Product.find(query).limit(50);
            return res.status(200).json({ success: true, data: products });
        } else {
            // Fallback or empty if mapping fails
            return res.status(200).json({ success: true, data: [] });
        }

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error fetching store products",
            error: error.message,
        });
    }
}

// Helper
async function getCategoryIdByName(name: string) {
    const cat = await Category.findOne({ name: { $regex: new RegExp(name, 'i') } });
    return cat ? cat._id : null;
}
