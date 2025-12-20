import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import Shop from "../../../models/Shop";

/**
 * Create a new shop
 */
export const createShop = asyncHandler(async (req: Request, res: Response) => {
    const { name, storeId, image, description, category, subCategory, products, order, isActive } = req.body;
  const { name, image, description, products, slug, bgColor, order } = req.body;

    if (!name || !image) {
        return res.status(400).json({
            success: false,
            message: "Shop name and image are required",
        });
    }

    // Generate storeId from name if not provided
    let finalStoreId = storeId;
    if (!finalStoreId) {
        finalStoreId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Check if storeId already exists
    const existingShop = await Shop.findOne({ storeId: finalStoreId });
    if (existingShop) {
        finalStoreId = `${finalStoreId}-${Date.now()}`;
    }
  if (!name || !image) {
    return res.status(400).json({
      success: false,
      message: "Shop name and image are required",
    });
  }

    const shop = await Shop.create({
        name,
        storeId: finalStoreId,
        image,
        description,
        category: category || undefined,
        subCategory: subCategory || undefined,
        products: products || [],
        order: order !== undefined ? order : 0,
        isActive: isActive !== undefined ? isActive : true,
    });
  const shop = await Shop.create({
    name,
    image,
    description,
    slug,
    bgColor,
    order: order || 0,
    products: products || [],
  });

  return res.status(201).json({
    success: true,
    message: "Shop created successfully",
    data: shop,
  });
});

/**
 * Get all shops
 */
export const getAllShops = asyncHandler(async (req: Request, res: Response) => {
    const { search, status, sortBy = 'order', sortOrder = 'asc' } = req.query;
    
    let query: any = {};
    
    // Filter by active status
    if (status === 'active') {
        query.isActive = true;
    } else if (status === 'inactive') {
        query.isActive = false;
    }
    
    // Search filter
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { storeId: { $regex: search, $options: 'i' } },
        ];
    }
    
    const sort: any = {};
    if (sortBy === 'order') {
        sort.order = sortOrder === 'desc' ? -1 : 1;
        sort.createdAt = -1; // Secondary sort
    } else {
        sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    }
    
    const shops = await Shop.find(query)
        .populate('category', 'name')
        .populate('subCategory', 'subcategoryName')
        .sort(sort);
export const getAllShops = asyncHandler(
  async (_req: Request, res: Response) => {
    const shops = await Shop.find({}).sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Shops fetched successfully",
      data: shops,
    });
  }
);

/**
 * Get shop by ID
 */
export const getShopById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const shop = await Shop.findById(id).populate("products");

  if (!shop) {
    return res.status(404).json({
      success: false,
      message: "Shop not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Shop fetched successfully",
    data: shop,
  });
});

/**
 * Update shop
 */
export const updateShop = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { storeId, ...updateData } = req.body;
    
    // If storeId is being updated, check for uniqueness
    if (storeId) {
        const existingShop = await Shop.findOne({ storeId, _id: { $ne: id } });
        if (existingShop) {
            return res.status(400).json({
                success: false,
                message: "Store ID already exists",
            });
        }
        updateData.storeId = storeId;
    }
  const { id } = req.params;
  const updateData = req.body;

    const shop = await Shop.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    })
    .populate("products")
    .populate('category', 'name')
    .populate('subCategory', 'subcategoryName');
  const shop = await Shop.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("products");

  if (!shop) {
    return res.status(404).json({
      success: false,
      message: "Shop not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Shop updated successfully",
    data: shop,
  });
});

/**
 * Delete shop
 */
export const deleteShop = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const shop = await Shop.findByIdAndDelete(id);

  if (!shop) {
    return res.status(404).json({
      success: false,
      message: "Shop not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Shop deleted successfully",
  });
});
