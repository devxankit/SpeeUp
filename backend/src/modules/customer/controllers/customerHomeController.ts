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
        const categories = await Category.find({
            status: "Active"
        })
            .select("name image icon color slug")
            .sort({ order: 1 });

        // 3. Shop By Store (Virtual categories)
        // Here we return categories that have a specific parent or tag, 
        // for now we'll keep the list but try to match with real category slugs
        const shops = [
            { id: 'spiritual-store', name: 'Spiritual Store', image: '/assets/shopbystore/spiritual.jpg', slug: 'spiritual' },
            { id: 'pharma-store', name: 'Pharma Store', image: '/assets/shopbystore/pharma.jpg', slug: 'pharma' },
            { id: 'e-gifts-store', name: 'E-Gifts Store', image: '/assets/shopbystore/egift.jpg', slug: 'e-gifts' },
            { id: 'pet-store', name: 'Pet Store', image: '/assets/shopbystore/pet.jpg', slug: 'pet-supplies' },
            { id: 'fashion-basics-store', name: 'Fashion Store', image: '/assets/shopbystore/fashion.jpg', slug: 'fashion' },
            { id: 'hobby-store', name: 'Hobby Store', image: '/assets/shopbystore/hobby.jpg', slug: 'hobbies' },
        ];

        // 4. Trending Items (Fetch some popular categories or products)
        const trendingCategories = await Category.find({
            status: "Active"
        }).limit(5).select("name image slug");

        const trending = trendingCategories.map(c => ({
            id: c._id,
            name: c.name,
            image: c.image || `/assets/categories/${c.slug}.jpg`,
            type: 'category'
        }));

        // 5. Cooking Ideas (Fetch some products from 'Food' or 'Grocery' categories)
        const foodProducts = await Product.find({
            status: "Active",
            publish: true
        }).limit(3).select("productName mainImage");

        const cookingIdeas = foodProducts.map(p => ({
            id: p._id,
            title: p.productName,
            image: p.mainImage,
            productId: p._id
        }));

        res.status(200).json({
            success: true,
            data: {
                bestsellers,
                categories,
                shops,
                promoBanners: [
                    { id: 1, image: 'https://img.freepik.com/free-vector/horizontal-banner-template-grocery-sales_23-2149432421.jpg', link: '/category/grocery' },
                    { id: 2, image: 'https://img.freepik.com/free-vector/flat-supermarket-social-media-cover-template_23-2149363385.jpg', link: '/category/snacks' }
                ],
                trending,
                cookingIdeas
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
        return res.status(500).json({
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
