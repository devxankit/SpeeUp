import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import Shop from "../../../models/Shop";

/**
 * Create a new shop
 */
export const createShop = asyncHandler(async (req: Request, res: Response) => {
  const { name, image, description, products, slug, bgColor, order } = req.body;

  if (!name || !image) {
    return res.status(400).json({
      success: false,
      message: "Shop name and image are required",
    });
  }

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
  const updateData = req.body;

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
