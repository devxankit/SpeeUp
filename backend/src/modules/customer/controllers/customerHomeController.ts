import { Request, Response } from "express";
import Product from "../../../models/Product";
import Category from "../../../models/Category";
import SubCategory from "../../../models/SubCategory";
import Shop from "../../../models/Shop";
import Seller from "../../../models/Seller";
import HeaderCategory from "../../../models/HeaderCategory";
import HomeSection from "../../../models/HomeSection";
import mongoose from "mongoose";

// Helper function to calculate distance between two coordinates (Haversine formula)
// function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
//   const R = 6371; // Earth radius in kilometers
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// Helper function to find sellers within user's location range
// async function findSellersWithinRange(userLat: number, userLng: number): Promise<mongoose.Types.ObjectId[]> {
//   if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
//     return [];
//   }

//   // Validate coordinates
//   if (userLat < -90 || userLat > 90 || userLng < -180 || userLng > 180) {
//     return [];
//   }

//   try {
//     // Fetch all approved sellers with location
//     const sellers = await Seller.find({
//       status: "Approved",
//       location: { $exists: true, $ne: null },
//       serviceRadiusKm: { $exists: true, $gt: 0 },
//     }).select("_id location serviceRadiusKm");

//     // Filter sellers where user is within their service radius
//     const nearbySellerIds: mongoose.Types.ObjectId[] = [];

//     for (const seller of sellers) {
//       if (seller.location && seller.location.coordinates) {
//         const sellerLng = seller.location.coordinates[0];
//         const sellerLat = seller.location.coordinates[1];
//         // const distance = calculateDistance(userLat, userLng, sellerLat, sellerLng);
//         // const serviceRadius = seller.serviceRadiusKm || 10;

//         // if (distance <= serviceRadius) {
//           nearbySellerIds.push(seller._id);
//         // }
//       }
//     }

//     return nearbySellerIds;
//   } catch (error) {
//     console.error("Error finding nearby sellers:", error);
//     return [];
//   }
// }

// Helper function to fetch data for a home section based on its configuration
async function fetchSectionData(section: any): Promise<any[]> {
  try {
    const { categories, subCategories, displayType, limit } = section;

    // If displayType is "subcategories", fetch subcategories
    if (displayType === "subcategories" && categories && categories.length > 0) {
      const categoryIds = categories.map((cat: any) => cat._id || cat);

      const subcategories = await SubCategory.find({
        category: { $in: categoryIds },
      })
        .select("name image order category")
        .sort({ order: 1 })
        .limit(limit || 10)
        .lean();

      return subcategories.map((sub: any) => ({
        id: sub._id.toString(),
        subcategoryId: sub._id.toString(),
        categoryId: sub.category?.toString() || "",
        name: sub.name,
        image: sub.image || "",
        slug: sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type: "subcategory",
      }));
    }

    // If displayType is "products", fetch products
    if (displayType === "products") {
      const query: any = {
        status: "Active",
        publish: true,
      };

      if (categories && categories.length > 0) {
        const categoryIds = categories
          .map((cat: any) => (cat ? cat._id || cat : null))
          .filter((id: any) => id);

        if (categoryIds.length > 0) {
          query.category = { $in: categoryIds };
        }
      }

      if (subCategories && subCategories.length > 0) {
        const subCategoryIds = subCategories
          .map((sub: any) => (sub ? sub._id || sub : null))
          .filter((id: any) => id);

        if (subCategoryIds.length > 0) {
          query.subcategory = { $in: subCategoryIds };
        }
      }

      const products = await Product.find(query)
        .sort({ createdAt: -1 }) // Show newest items first
        .limit(limit || 8)
        .select("productName mainImage price mrp discount")
        .lean();

      return products.map((p: any) => ({
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

    // If displayType is "categories", fetch the selected categories themselves
    if (displayType === "categories") {
      // If categories are specified, fetch those specific categories
      if (categories && categories.length > 0) {
        const categoryIds = categories.map((cat: any) => cat._id || cat);

        const fetchedCategories = await Category.find({
          _id: { $in: categoryIds },
          status: "Active",
        })
          .select("name image slug")
          .sort({ order: 1 })
          .limit(limit || 8)
          .lean();

        return fetchedCategories.map((c: any) => ({
          id: c._id.toString(),
          categoryId: c.slug || c._id.toString(), // Use slug for SEO-friendly URLs, fallback to _id
          name: c.name,
          image: c.image,
          slug: c.slug,
          type: "category",
        }));
      } else {
        // If no categories specified, return empty array
        return [];
      }
    }

    return [];
  } catch (error) {
    console.error("Error fetching section data:", error);
    return [];
  }
}

// Get Home Page Content
export const getHomeContent = async (req: Request, res: Response) => {
  const { headerCategorySlug } = req.query; // Get header category slug from query params
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
      .populate("category", "name slug")
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

    // 6. Personal Care Subcategories - Now handled by dynamic sections

    // 7. Cooking Ideas (Fetch some products from 'Food' or 'Grocery' categories)
    const foodProducts = await Product.find({
      status: "Active",
      publish: true,
      // $or: [
      //   { category: { $in: foodCategoryIds } },
      //   { subCategory: { $in: foodSubCategoryIds } },
      // ],
    })
      .limit(3)
      .select("productName mainImage");

    const cookingIdeas = foodProducts.map((p) => ({
      id: p._id,
      title: p.productName,
      image: p.mainImage,
      productId: p._id,
    }));

    // 8. Promo Cards (Dynamic - Categories with headerCategoryId)
    // Fetch root categories (parentId: null) that have a headerCategoryId assigned and are Active
    // If headerCategorySlug is provided, filter by that specific header category
    // Include their child categories (subcategories) with images

    // Build query for categories
    const categoryQuery: any = {
      headerCategoryId: { $exists: true, $ne: null },
      status: "Active",
      parentId: null, // Only root categories (not subcategories themselves)
    };

    // If headerCategorySlug is provided, find the header category and filter by it
    if (headerCategorySlug && headerCategorySlug !== "all") {
      const headerCategory = await HeaderCategory.findOne({
        slug: headerCategorySlug,
        status: "Published",
      }).lean();

      if (headerCategory) {
        categoryQuery.headerCategoryId = headerCategory._id;
      } else {
        // If header category not found, return empty promo cards for this header category
        // The query will still work but won't match any categories
        console.log(
          `Header category with slug "${headerCategorySlug}" not found`
        );
      }
    }

    const categoriesWithHeaderCategory = await Category.find(categoryQuery)
      .populate("headerCategoryId", "name status")
      .sort({ order: 1 })
      .limit(4) // Limit to 4 promo cards
      .lean();

    const promoCards = await Promise.all(
      categoriesWithHeaderCategory.map(async (category: any) => {
        // Get child categories (subcategories) for this category
        const childCategories = await Category.find({
          parentId: category._id,
          status: "Active",
        })
          .select("name image _id")
          .sort({ order: 1 })
          .limit(4) // Limit to 4 subcategory images
          .lean();

        // Extract subcategory images
        const subcategoryImages = childCategories
          .map((child: any) => child.image)
          .filter((img: string) => img && img.trim() !== "");

        return {
          id: category._id.toString(),
          badge: "Up to 55% OFF", // Default badge, can be customized later
          title: category.name,
          categoryId: category._id.toString(),
          slug: category.slug || category._id.toString(),
          bgColor: "bg-yellow-50",
          subcategoryImages: subcategoryImages.slice(0, 4), // Max 4 images
        };
      })
    );

    // Fallback to hardcoded cards if no categories with headerCategoryId exist
    const finalPromoCards =
      promoCards.length > 0
        ? promoCards
        : [
          {
            id: "self-care",
            badge: "Up to 55% OFF",
            title: "Self Care & Wellness",
            categoryId: "personal-care",
            bgColor: "bg-yellow-50",
            subcategoryImages: [],
          },
          {
            id: "hot-meals",
            badge: "Up to 55% OFF",
            title: "Hot Meals & Drinks",
            categoryId: "breakfast-instant",
            bgColor: "bg-yellow-50",
            subcategoryImages: [],
          },
          {
            id: "kitchen-essentials",
            badge: "Up to 55% OFF",
            title: "Kitchen Essentials",
            categoryId: "atta-rice",
            bgColor: "bg-yellow-50",
            subcategoryImages: [],
          },
          {
            id: "cleaning-home",
            badge: "Up to 75% OFF",
            title: "Cleaning & Home Needs",
            categoryId: "household",
            bgColor: "bg-yellow-50",
            subcategoryImages: [],
          },
        ];

    // 9. Dynamic Home Sections - Fetch from database
    const homeSections = await HomeSection.find({ isActive: true })
      .populate("categories", "name slug image")
      .populate("subCategories", "name")
      .sort({ order: 1 })
      .lean();

    // Fetch data for each section
    const dynamicSections = await Promise.all(
      homeSections.map(async (section: any) => {
        const sectionData = await fetchSectionData(section);
        return {
          id: section._id.toString(),
          title: section.title,
          slug: section.slug,
          displayType: section.displayType,
          columns: section.columns,
          data: sectionData,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        bestsellers,
        categories,
        // Dynamic sections created by admin
        homeSections: dynamicSections,
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
        promoCards: finalPromoCards, // Return dynamic or fallback cards
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
    const { latitude, longitude } = req.query; // User location for filtering
    let query: any = { status: "Active", publish: true };

    console.log(`[getStoreProducts] Looking for shop with storeId: ${storeId}`);

    // Build shop query - only include _id if storeId is a valid ObjectId
    const shopQuery: any = { isActive: true };
    if (mongoose.Types.ObjectId.isValid(storeId)) {
      shopQuery.$or = [
        { storeId: storeId.toLowerCase() },
        { _id: new mongoose.Types.ObjectId(storeId) }
      ];
    } else {
      shopQuery.storeId = storeId.toLowerCase();
    }

    // Find the shop by storeId or _id
    const shop = await Shop.findOne(shopQuery)
      .populate("category", "_id name slug image")
      .populate("subCategory", "_id name")
      .lean();

    console.log(`[getStoreProducts] Shop found:`, shop ? { name: shop.name, productsCount: shop.products?.length || 0, category: shop.category, image: shop.image } : 'NOT FOUND');

    let shopData: any = null;

    if (shop) {
      shopData = {
        name: shop.name,
        image: shop.image,
        description: shop.description || '',
        category: shop.category,
      };

      // Convert products array to ObjectIds if needed
      // When using .lean(), products array contains ObjectIds directly
      let productIds: mongoose.Types.ObjectId[] = [];
      if (shop.products && shop.products.length > 0) {
        productIds = shop.products.map((p: any) => {
          // Handle different formats: ObjectId, string, or object with _id
          if (mongoose.Types.ObjectId.isValid(p)) {
            return typeof p === 'string' ? new mongoose.Types.ObjectId(p) : p;
          }
          return p._id ? (typeof p._id === 'string' ? new mongoose.Types.ObjectId(p._id) : p._id) : p;
        }).filter(Boolean);
      }

      console.log(`[getStoreProducts] Shop has ${productIds.length} products assigned`);

      // If shop has specific products assigned, use those
      if (productIds.length > 0) {
        query._id = { $in: productIds };
        console.log(`[getStoreProducts] Filtering by product IDs: ${productIds.length} products`);
      }
      // Otherwise, filter by category/subcategory
      else if (shop.category) {
        const categoryId = (shop.category as any)._id || (shop.category as any);
        query.category = categoryId;
        console.log(`[getStoreProducts] Filtering by category: ${categoryId}`);

        // If subcategory is also specified, filter by both
        if (shop.subCategory) {
          const subCategoryId = (shop.subCategory as any)._id || (shop.subCategory as any);
          query.$or = [
            { category: categoryId },
            { subcategory: subCategoryId },
          ];
          console.log(`[getStoreProducts] Also filtering by subcategory: ${subCategoryId}`);
        }
      } else {
        console.log(`[getStoreProducts] Shop has no products or category, cannot build query`);
      }
    } else {
      // Fallback: try to match by category name (legacy support)
      const categoryId = await getCategoryIdByName(storeId);
      if (categoryId) {
        query.category = categoryId;
        // Try to get category details for shop data
        const category = await Category.findById(categoryId).select("name slug image").lean();
        if (category) {
          shopData = {
            name: category.name,
            image: category.image || '',
            description: '',
            category: category,
          };
        }
      } else {
        // No matching shop or category found
        return res.status(200).json({
          success: true,
          data: [],
          shop: null,
          message: "Store not found"
        });
      }
    }

    // Location-based filtering: Only show products from sellers within user's range
    // TEMPORARILY DISABLED: Allow all products regardless of location
    const userLat = latitude ? parseFloat(latitude as string) : null;
    const userLng = longitude ? parseFloat(longitude as string) : null;

    console.log(`[getStoreProducts] User location: lat=${userLat}, lng=${userLng}`);

    /*
    // Original Location Logic - Commented out
    if (userLat && userLng && !isNaN(userLat) && !isNaN(userLng)) {
      const nearbySellerIds = await findSellersWithinRange(userLat, userLng);
      console.log(`[getStoreProducts] Found ${nearbySellerIds.length} sellers within range`);

      if (nearbySellerIds.length === 0) {
        // No sellers within range, return shop data but empty products
        console.log(`[getStoreProducts] No sellers in range, returning empty products`);
        return res.status(200).json({
          success: true,
          data: [],
          shop: shopData,
          pagination: {
            page: 1,
            limit: 50,
            total: 0,
            pages: 0,
          },
          message: "No sellers available in your area. Please update your location.",
        });
      }

      // Filter products by sellers within range
      query.seller = { $in: nearbySellerIds };
      console.log(`[getStoreProducts] Added seller filter to query`);
    } else {
      // If no location provided, return empty (require location for marketplace)
      console.log(`[getStoreProducts] No location provided, returning empty products`);
      return res.status(200).json({
        success: true,
        data: [],
        shop: shopData,
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0,
        },
        message: "Location is required to view products. Please enable location access.",
      });
    }
    */

    console.log(`[getStoreProducts] Final query:`, JSON.stringify(query, null, 2));

    const products = await Product.find(query)
      .populate("category", "name icon image")
      .populate("subcategory", "name")
      .populate("brand", "name")
      .populate("seller", "storeName")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const total = await Product.countDocuments(query);

    console.log(`[getStoreProducts] Found ${total} products matching query, returning ${products.length}`);

    return res.status(200).json({
      success: true,
      data: products,
      shop: shopData,
      pagination: {
        page: 1,
        limit: 50,
        total,
        pages: Math.ceil(total / 50),
      },
    });
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
