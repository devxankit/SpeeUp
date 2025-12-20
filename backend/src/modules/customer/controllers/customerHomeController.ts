import { Request, Response } from "express";
import Product from "../../../models/Product";
import Category from "../../../models/Category";
import Shop from "../../../models/Shop";

// Get Home Page Content
export const getHomeContent = async (_req: Request, res: Response) => {
  try {
    // 1. Featured / Bestsellers (Top 10 popular products)
    const bestsellers = await Product.find({
      status: "Active",
      publish: true,
      popular: true,
    })
      .limit(10)
      .select("productName price mainImage discount rating reviews pack");

    // 2. Categories for Tiles (Grocery, Snacks, etc)
    const categories = await Category.find({
      status: "Active",
    })
      .select("name image icon color slug")
      .sort({ order: 1 });

    // 3. Shop By Store - Fetch from database
    const shopDocuments = await Shop.find({ isActive: true })
      .populate('category', 'name slug')
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // Transform shop data to match frontend expected format
    const shops = shopDocuments.map((shop: any) => ({
      id: shop.storeId || shop._id.toString(),
      name: shop.name,
      image: shop.image,
      slug: shop.storeId || shop._id.toString(),
      category: shop.category,
      productIds: shop.products?.map((p: any) => p.toString()) || [],
      bgColor: shop.bgColor || "bg-neutral-50",
    }));

    // 4. Trending Items (Fetch some popular categories or products)
    const trendingCategories = await Category.find({
      status: "Active",
    })
      .limit(5)
      .select("name image slug");

    const trending = trendingCategories.map((c) => ({
      id: c._id,
      name: c.name,
      image: c.image || `/assets/categories/${c.slug}.jpg`,
      type: "category",
    }));

    // 5. Cooking Ideas (Fetch some products from 'Food' or 'Grocery' categories)
    const foodProducts = await Product.find({
      status: "Active",
      publish: true,
    })
      .limit(3)
      .select("productName mainImage");

    const cookingIdeas = foodProducts.map((p) => ({
      id: p._id,
      title: p.productName,
      image: p.mainImage,
      productId: p._id,
    }));

    // 6. Promo Cards (Curated collections for PromoStrip)
    // These match the frontend "PromoCard" interface
    // Added specifically to restore missing frontend section via API
    const promoCards = [
      {
        id: "self-care",
        badge: "Up to 55% OFF",
        title: "Self Care & Wellness",
        categoryId: "personal-care",
        bgColor: "bg-yellow-50",
      },
      {
        id: "hot-meals",
        badge: "Up to 55% OFF",
        title: "Hot Meals & Drinks",
        categoryId: "breakfast-instant",
        bgColor: "bg-yellow-50",
      },
      {
        id: "kitchen-essentials",
        badge: "Up to 55% OFF",
        title: "Kitchen Essentials",
        categoryId: "atta-rice",
        bgColor: "bg-yellow-50",
      },
      {
        id: "cleaning-home",
        badge: "Up to 75% OFF",
        title: "Cleaning & Home Needs",
        categoryId: "household",
        bgColor: "bg-yellow-50",
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        bestsellers,
        categories,
        shops,
        promoBanners: [
          {
            id: 1,
            image:
              "https://img.freepik.com/free-vector/horizontal-banner-template-grocery-sales_23-2149432421.jpg",
            link: "/category/grocery",
          },
          {
            id: 2,
            image:
              "https://img.freepik.com/free-vector/flat-supermarket-social-media-cover-template_23-2149363385.jpg",
            link: "/category/snacks",
          },
        ],
        trending,
        cookingIdeas,
        promoCards, // Return the curated cards
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
// Fetch products based on store configuration from database
export const getStoreProducts = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    let query: any = { status: "Active", publish: true };

        // Find the shop by storeId
        const shop = await Shop.findOne({ 
            $or: [
                { storeId: storeId },
                { _id: storeId }
            ],
            isActive: true
        })
        .populate('category', '_id')
        .populate('subCategory', '_id');

        if (shop) {
            // If shop has specific products assigned, use those
            if (shop.products && shop.products.length > 0) {
                query._id = { $in: shop.products };
            } 
            // Otherwise, filter by category/subcategory
            else if (shop.category) {
                query.category = shop.category._id;
                
                // If subcategory is also specified, filter by both
                if (shop.subCategory) {
                    query.$or = [
                        { category: shop.category._id },
                        { subcategory: shop.subCategory._id }
                    ];
                }
            }
        } else {
            // Fallback: try to match by category name (legacy support)
            const categoryId = await getCategoryIdByName(storeId);
            if (categoryId) {
                query.category = categoryId;
            } else {
                // No matching shop or category found
                return res.status(200).json({ success: true, data: [] });
            }
        }

        const products = await Product.find(query)
            .populate('category', 'name slug')
            .limit(50);
            
        return res.status(200).json({ success: true, data: products });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Error fetching store products",
            error: error.message,
        });
    }
};

// Helper
async function getCategoryIdByName(name: string) {
  const cat = await Category.findOne({
    name: { $regex: new RegExp(name, "i") },
  });
  return cat ? cat._id : null;
}
