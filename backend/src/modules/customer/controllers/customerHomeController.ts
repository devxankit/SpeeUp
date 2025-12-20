import { Request, Response } from "express";
import Product from "../../../models/Product";
import Category from "../../../models/Category";
import SubCategory from "../../../models/SubCategory";
import Shop from "../../../models/Shop";
import Seller from "../../../models/Seller";

// Get Home Page Content
export const getHomeContent = async (_req: Request, res: Response) => {
  try {
    // 1. Featured / Bestsellers - Get 6 sellers with their top 4 products each
    // First, get approved sellers
    const approvedSellers = await Seller.find({
      status: "Approved",
    })
      .select("_id storeName logo")
      .limit(6)
      .lean();

    // For each seller, get their top 4 popular/active products
    const sellerCards = await Promise.all(
      approvedSellers.map(async (seller) => {
        const sellerProducts = await Product.find({
          seller: seller._id,
          status: "Active",
          publish: true,
        })
          .select("productName mainImage galleryImages")
          .limit(4)
          .lean();

        // Extract exactly 4 product images (one mainImage from each of 4 products)
        const productImages: string[] = [];
        sellerProducts.forEach((product) => {
          if (productImages.length < 4 && product.mainImage) {
            productImages.push(product.mainImage);
          }
        });

        // If we have less than 4 products, try to use gallery images
        if (productImages.length < 4) {
          sellerProducts.forEach((product) => {
            if (
              productImages.length < 4 &&
              product.galleryImages &&
              product.galleryImages.length > 0
            ) {
              productImages.push(product.galleryImages[0]);
            }
          });
        }

        // Ensure we have exactly 4 images (pad with first image if needed)
        while (productImages.length < 4 && productImages[0]) {
          productImages.push(productImages[0]);
        }

        return {
          id: seller._id.toString(),
          sellerId: seller._id.toString(),
          name: seller.storeName,
          logo: seller.logo,
          productImages: productImages.slice(0, 4),
          productCount: sellerProducts.length,
        };
      })
    );

    // Fallback: If we don't have enough sellers, use popular products grouped by seller
    let bestsellers = sellerCards;
    if (sellerCards.length < 6) {
      // Get popular products and group by seller
      const popularProducts = await Product.find({
        status: "Active",
        publish: true,
        popular: true,
      })
        .select("seller productName mainImage galleryImages")
        .populate("seller", "storeName logo")
        .limit(24) // Get enough products to fill 6 sellers × 4 products
        .lean();

      // Group products by seller
      const sellerMap = new Map();
      popularProducts.forEach((product: any) => {
        if (!product.seller || !product.seller._id) return;

        const sellerId = product.seller._id.toString();
        if (!sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, {
            id: sellerId,
            sellerId: sellerId,
            name: product.seller.storeName || "Seller",
            logo: product.seller.logo,
            productImages: [],
            productCount: 0,
          });
        }

        const sellerCard = sellerMap.get(sellerId);
        if (sellerCard.productImages.length < 4) {
          // Prefer mainImage, fallback to first gallery image
          const imageToAdd =
            product.mainImage ||
            (product.galleryImages && product.galleryImages[0]
              ? product.galleryImages[0]
              : null);
          if (imageToAdd) {
            sellerCard.productImages.push(imageToAdd);
            sellerCard.productCount++;
          }
        }
      });

      // Convert map to array and take first 6
      bestsellers = Array.from(sellerMap.values())
        .filter((card) => card.productImages.length > 0)
        .slice(0, 6);

      // Pad images if needed
      bestsellers.forEach((card) => {
        while (card.productImages.length < 4 && card.productImages[0]) {
          card.productImages.push(card.productImages[0]);
        }
        card.productImages = card.productImages.slice(0, 4);
      });
    }

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

    // 5. Grocery & Kitchen Subcategories - Fetch subcategories from "Grocery & Kitchen" category
    const groceryKitchenCategory = await Category.findOne({
      slug: "grocery-kitchen",
      status: "Active",
    }).lean();

    let groceryKitchenTiles: any[] = [];

    if (groceryKitchenCategory) {
      // Fetch subcategories for Grocery & Kitchen category
      const subcategories = await SubCategory.find({
        category: groceryKitchenCategory._id,
      })
        .select("name image order")
        .sort({ order: 1 })
        .limit(10)
        .lean();

      groceryKitchenTiles = subcategories.map((sub: any) => ({
        id: sub._id.toString(),
        subcategoryId: sub._id.toString(),
        categoryId: groceryKitchenCategory._id.toString(),
        name: sub.name,
        image: sub.image || groceryKitchenCategory.image,
        slug: sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type: "subcategory",
      }));
    } else {
      // Fallback: If category doesn't exist, fetch products from grocery/kitchen categories
      const groceryKitchenCategories = await Category.find({
        status: "Active",
        $or: [
          { slug: { $regex: /grocery|kitchen|atta|rice|dal|spices|oil/i } },
          { name: { $regex: /grocery|kitchen|atta|rice|dal|spices|oil/i } },
        ],
      })
        .select("_id")
        .lean();

      const groceryKitchenCategoryIds = groceryKitchenCategories.map(
        (c) => c._id
      );

      const groceryKitchenProducts = await Product.find({
        status: "Active",
        publish: true,
        category: { $in: groceryKitchenCategoryIds },
      })
        .limit(8)
        .select("productName mainImage price mrp discount")
        .lean();

      groceryKitchenTiles = groceryKitchenProducts.map((p: any) => ({
        id: p._id.toString(),
        productId: p._id.toString(),
        name: p.productName,
        productName: p.productName,
        image: p.mainImage,
        mainImage: p.mainImage,
        price: p.price,
        discount:
          p.discount ||
          (p.mrp && p.price
            ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
            : 0),
        productImages: p.mainImage ? [p.mainImage] : [],
        type: "product",
      }));
    }

    // 5b. Personal Care Subcategories - Fetch subcategories from "Personal Care" category
    const personalCareCategory = await Category.findOne({
      slug: "personal-care",
      status: "Active",
    }).lean();

    let personalCareTiles: any[] = [];

    if (personalCareCategory) {
      // Fetch subcategories for Personal Care category
      const subcategories = await SubCategory.find({
        category: personalCareCategory._id,
      })
        .select("name image order")
        .sort({ order: 1 })
        .limit(10)
        .lean();

      personalCareTiles = subcategories.map((sub: any) => ({
        id: sub._id.toString(),
        subcategoryId: sub._id.toString(),
        categoryId: personalCareCategory._id.toString(),
        name: sub.name,
        image: sub.image || personalCareCategory.image,
        slug: sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type: "subcategory",
      }));
    } else {
      // Fallback: If category doesn't exist, fetch products from personal care categories
      const personalCareCategories = await Category.find({
        status: "Active",
        $or: [
          { slug: { $regex: /personal-care|beauty|health|wellness/i } },
          { name: { $regex: /personal-care|beauty|health|wellness/i } },
        ],
      })
        .select("_id")
        .lean();

      const personalCareCategoryIds = personalCareCategories.map((c) => c._id);

      const personalCareProducts = await Product.find({
        status: "Active",
        publish: true,
        category: { $in: personalCareCategoryIds },
      })
        .limit(8)
        .select("productName mainImage price mrp discount")
        .lean();

      personalCareTiles = personalCareProducts.map((p: any) => ({
        id: p._id.toString(),
        productId: p._id.toString(),
        name: p.productName,
        productName: p.productName,
        image: p.mainImage,
        mainImage: p.mainImage,
        price: p.price,
        discount:
          p.discount ||
          (p.mrp && p.price
            ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
            : 0),
        productImages: p.mainImage ? [p.mainImage] : [],
        type: "product",
      }));
    }

    // 6. Personal Care Subcategories - Already fetched above

    // 7. Cooking Ideas (Fetch some products from 'Food' or 'Grocery' categories)
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

    // 8. Promo Cards (Curated collections for PromoStrip)
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
        groceryKitchenProducts: groceryKitchenTiles,
        personalCareProducts: personalCareTiles,
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
