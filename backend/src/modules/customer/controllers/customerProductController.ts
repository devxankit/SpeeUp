import { Request, Response } from "express";
import Product from "../../../models/Product";
import Category from "../../../models/Category";
import SubCategory from "../../../models/SubCategory";
import Seller from "../../../models/Seller";
import mongoose from "mongoose";

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper function to find sellers within user's location range
async function findSellersWithinRange(
  userLat: number,
  userLng: number
): Promise<mongoose.Types.ObjectId[]> {
  if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
    // If no location provided, return empty array (no sellers)
    return [];
  }

  // Validate coordinates
  if (userLat < -90 || userLat > 90 || userLng < -180 || userLng > 180) {
    return [];
  }

  try {
    // Fetch all approved sellers with location
    const sellers = await Seller.find({
      status: "Approved",
      location: { $exists: true, $ne: null },
      serviceRadiusKm: { $exists: true, $gt: 0 },
    }).select("_id location serviceRadiusKm");

    // Filter sellers where user is within their service radius
    const nearbySellerIds: mongoose.Types.ObjectId[] = [];

    for (const seller of sellers) {
      if (seller.location && seller.location.coordinates) {
        const sellerLng = seller.location.coordinates[0];
        const sellerLat = seller.location.coordinates[1];
        const distance = calculateDistance(
          userLat,
          userLng,
          sellerLat,
          sellerLng
        );
        const serviceRadius = seller.serviceRadiusKm || 10;

        if (distance <= serviceRadius) {
          nearbySellerIds.push(seller._id);
        }
      }
    }

    return nearbySellerIds;
  } catch (error) {
    console.error("Error finding nearby sellers:", error);
    return [];
  }
}

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
      // latitude, // User location latitude
      // longitude, // User location longitude
    } = req.query;

    const query: any = {
      status: "Active",
      publish: true,
    };

    // Location-based filtering: Only show products from sellers within user's range
    // TEMPORARILY DISABLED: Allow all products regardless of location
    // const userLat = latitude ? parseFloat(latitude as string) : null;
    // const userLng = longitude ? parseFloat(longitude as string) : null;

    /*
    // Original Location Logic - Commented out
    if (userLat && userLng && !isNaN(userLat) && !isNaN(userLng)) {
      // Find sellers within user's location range
      const nearbySellerIds = await findSellersWithinRange(userLat, userLng);

      if (nearbySellerIds.length === 0) {
        // No sellers within range, return empty result
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            pages: 0,
          },
          message:
            "No sellers available in your area. Please update your location.",
        });
      }

      // Filter products by sellers within range
      query.seller = { $in: nearbySellerIds };
    } else {
      // If no location provided, return empty (require location for marketplace)
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0,
        },
        message:
          "Location is required to view products. Please enable location access.",
      });
    }
    */

    // Helper to resolve category/subcategory ID from slug or ID
    const resolveId = async (
      model: any,
      value: string,
      modelName: string = ""
    ) => {
      if (mongoose.Types.ObjectId.isValid(value)) return value;

      // Build query - only check status if model has status field (Category has it, SubCategory might not)
      const baseQuery: any = {};
      if (modelName === "Category") {
        baseQuery.status = "Active";
      }

      // Try exact slug match first
      let item = await model
        .findOne({ ...baseQuery, slug: value })
        .select("_id")
        .lean();
      if (item) return item._id;

      // Try case-insensitive slug match
      item = await model
        .findOne({
          ...baseQuery,
          slug: { $regex: new RegExp(`^${value}$`, "i") },
        })
        .select("_id")
        .lean();
      if (item) return item._id;

      // Try name match as fallback (case-insensitive) - replace hyphens/underscores with spaces
      let namePattern = value.replace(/[-_]/g, " ");
      item = await model
        .findOne({
          ...baseQuery,
          name: { $regex: new RegExp(`^${namePattern}$`, "i") },
        })
        .select("_id")
        .lean();
      if (item) return item._id;

      // Special handling for Category and "and" -> "&"
      if (modelName === "Category" && value.includes("and")) {
         const withAmpersand = value.replace(/-and-/g, " & ").replace(/-/g, " ");
         item = await model
           .findOne({
             ...baseQuery,
             name: { $regex: new RegExp(`^${withAmpersand}$`, "i") },
           })
           .select("_id")
           .lean();
         if (item) return item._id;
      }

      return null;
    };

    if (category) {
      const categoryId = await resolveId(
        Category,
        category as string,
        "Category"
      );
      if (categoryId) query.category = categoryId;
    }

    if (subcategory) {
      // Try to resolve from Category model first (new structure where subcategories are categories with parentId)
      let subcategoryId = await resolveId(
        Category,
        subcategory as string,
        "Category"
      );
      // If not found in Category, try old SubCategory model (backward compatibility)
      if (!subcategoryId) {
        subcategoryId = await resolveId(
          SubCategory,
          subcategory as string,
          "SubCategory"
        );
      }
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
    const { latitude, longitude, skipLocationCheck } = req.query; // User location and optional skip flag

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
      .populate(
        "seller",
        "storeName city fssaiLicNo address location serviceRadiusKm"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unavailable",
      });
    }

    // Parse location and skipLocationCheck flag
    const userLat = latitude ? parseFloat(latitude as string) : null;
    const userLng = longitude ? parseFloat(longitude as string) : null;
    const shouldSkipLocationCheck =
      typeof skipLocationCheck === "string" && skipLocationCheck.toLowerCase() === "true";
    const seller = product.seller as any;

    // Initialize availability flag
    let isAvailableAtLocation = false;

    // Safely get seller ID - handle both populated and unpopulated cases
    let sellerId: mongoose.Types.ObjectId | null = null;
    if (seller) {
      if (typeof seller === 'object' && seller._id) {
        // Seller is populated
        sellerId = seller._id;
      } else if (seller instanceof mongoose.Types.ObjectId) {
        // Seller is an ObjectId (not populated)
        sellerId = seller;
      } else if (typeof seller === 'string') {
        // Seller is a string ID
        sellerId = new mongoose.Types.ObjectId(seller);
      }
    }

    // Check location availability if coordinates are provided
    if (
      userLat &&
      userLng &&
      !isNaN(userLat) &&
      !isNaN(userLng) &&
      sellerId &&
      seller?.location
    ) {
      const nearbySellerIds = await findSellersWithinRange(userLat, userLng);
      isAvailableAtLocation = nearbySellerIds.some(id => id.toString() === sellerId!.toString());

      // If location check is NOT skipped and product is not available, return 403
      if (!shouldSkipLocationCheck && !isAvailableAtLocation) {
        return res.status(403).json({
          success: false,
          message:
            "This product is not available in your location. Please check sellers within your area.",
        });
      }
    } else if (!userLat || !userLng) {
      // If no location provided and location check is NOT skipped, return 400
      if (!shouldSkipLocationCheck) {
        return res.status(400).json({
          success: false,
          message: "Location is required to view product details",
        });
      }
      // If location check is skipped, we can't determine availability
      isAvailableAtLocation = false;
    }

    // Find similar products (by category)
    // Filter by location if coordinates are provided and location check is not skipped
    const similarProductsQuery: any = {
      _id: { $ne: product._id },
      status: "Active",
      publish: true,
    };

    // Safely get category ID - handle both populated and unpopulated cases
    let categoryId: mongoose.Types.ObjectId | null = null;
    if (product.category) {
      if (typeof product.category === 'object' && (product.category as any)._id) {
        // Category is populated
        categoryId = (product.category as any)._id;
      } else if (product.category instanceof mongoose.Types.ObjectId) {
        // Category is an ObjectId (not populated)
        categoryId = product.category;
      } else if (typeof product.category === 'string') {
        // Category is a string ID
        categoryId = new mongoose.Types.ObjectId(product.category);
      }
    }

    // Only add category filter if we have a valid category ID
    if (categoryId) {
      similarProductsQuery.category = categoryId;
    }

    // Filter similar products by location if available and location check is not skipped
    if (
      userLat &&
      userLng &&
      !isNaN(userLat) &&
      !isNaN(userLng) &&
      !shouldSkipLocationCheck
    ) {
      const nearbySellerIds = await findSellersWithinRange(userLat, userLng);
      if (nearbySellerIds.length > 0) {
        similarProductsQuery.seller = { $in: nearbySellerIds };
      } else {
        // No sellers nearby, return empty similar products
        similarProductsQuery.seller = { $in: [] };
      }
    }
    // If shouldSkipLocationCheck is true, show all similar products regardless of location

    const similarProducts = await Product.find(similarProductsQuery)
      .limit(6)
      .select("productName price mainImage pack discount _id rating reviewsCount");

    return res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        similarProducts,
        isAvailableAtLocation, // Add availability flag to response
      },
    });
  } catch (error: any) {
    console.error("Error in getProductById:", {
      productId: req.params.id,
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Error fetching product details",
      error: error.message,
    });
  }
};
