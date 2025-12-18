import { Request, Response } from "express";
import Product from "../../../models/Product";
import { asyncHandler } from "../../../utils/asyncHandler";

/**
 * Create a new product
 */
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.userId;
    const productData = req.body;

    // Ensure sellerId matches authenticated seller
    if (productData.sellerId && productData.sellerId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "You can only create products for your own account",
      });
    }

    // Set sellerId from authenticated user
    productData.sellerId = sellerId;

    // Validate variations
    if (!productData.variations || productData.variations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product must have at least one variation",
      });
    }

    // Validate variation prices
    for (const variation of productData.variations) {
      if (variation.discPrice > variation.price) {
        return res.status(400).json({
          success: false,
          message: `Discounted price (${variation.discPrice}) cannot be greater than price (${variation.price}) for variation ${variation.title}`,
        });
      }
    }

    const product = await Product.create(productData);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  }
);

/**
 * Get seller's products with filters
 */
export const getProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.userId;
    const {
      search,
      category,
      status,
      stock,
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query: any = { sellerId };

    // Search filter
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { smallDescription: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search as string, "i")] } },
      ];
    }

    // Category filter
    if (category) {
      query.categoryId = category;
    }

    // Status filter (publish, popular, dealOfDay)
    if (status) {
      if (status === "published") {
        query.publish = true;
      } else if (status === "unpublished") {
        query.publish = false;
      } else if (status === "popular") {
        query.popular = true;
      } else if (status === "dealOfDay") {
        query.dealOfDay = true;
      }
    }

    // Stock filter
    if (stock === "inStock") {
      query["variations.stock"] = { $gt: 0 };
    } else if (stock === "outOfStock") {
      query["variations.stock"] = 0;
      query["variations.status"] = "Sold out";
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const products = await Product.find(query)
      .populate("categoryId", "name")
      .populate("subcategoryId", "name")
      .populate("brandId", "name")
      .populate("taxId", "name rate")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);

/**
 * Get product by ID
 */
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.userId;
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, sellerId })
      .populate("categoryId", "name")
      .populate("subcategoryId", "name")
      .populate("brandId", "name")
      .populate("taxId", "name rate");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  }
);

/**
 * Update product
 */
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.userId;
    const { id } = req.params;
    const updateData = req.body;

    // Remove sellerId from update data if present (cannot change owner)
    delete updateData.sellerId;

    // Validate variations if provided
    if (updateData.variations) {
      if (updateData.variations.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Product must have at least one variation",
        });
      }

      // Validate variation prices
      for (const variation of updateData.variations) {
        if (variation.discPrice > variation.price) {
          return res.status(400).json({
            success: false,
            message: `Discounted price cannot be greater than price for variation ${variation.title}`,
          });
        }
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, sellerId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("categoryId", "name")
      .populate("subcategoryId", "name")
      .populate("brandId", "name")
      .populate("taxId", "name rate");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  }
);

/**
 * Delete product
 */
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.userId;
    const { id } = req.params;

    const product = await Product.findOneAndDelete({ _id: id, sellerId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  }
);

/**
 * Update stock for a product variation
 */
export const updateStock = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.userId;
    const { id, variationId } = req.params;
    const { stock, status } = req.body;

    const product = await Product.findOne({ _id: id, sellerId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const variation = product.variations.id(variationId);
    if (!variation) {
      return res.status(404).json({
        success: false,
        message: "Variation not found",
      });
    }

    if (stock !== undefined) {
      variation.stock = stock;
    }
    if (status) {
      variation.status = status;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: product,
    });
  }
);

/**
 * Update product status (publish, popular, dealOfDay)
 */
export const updateProductStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.userId;
    const { id } = req.params;
    const { publish, popular, dealOfDay } = req.body;

    const updateData: any = {};
    if (publish !== undefined) updateData.publish = publish;
    if (popular !== undefined) updateData.popular = popular;
    if (dealOfDay !== undefined) updateData.dealOfDay = dealOfDay;

    const product = await Product.findOneAndUpdate(
      { _id: id, sellerId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      data: product,
    });
  }
);

/**
 * Bulk update stock for multiple products/variations
 */
export const bulkUpdateStock = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.userId;
    const { updates } = req.body; // Array of { productId, variationId, stock }

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: "Updates must be an array",
      });
    }

    const results = [];
    for (const update of updates) {
      const { productId, variationId, stock } = update;

      const product = await Product.findOne({ _id: productId, sellerId });
      if (product) {
        const variation = product.variations.id(variationId);
        if (variation) {
          variation.stock = stock;
          if (stock === 0) variation.status = "Sold out";
          else if (stock > 0 && variation.status === "Sold out") variation.status = "In stock";

          await product.save();
          results.push({ productId, variationId, success: true });
        } else {
          results.push({ productId, variationId, success: false, message: "Variation not found" });
        }
      } else {
        results.push({ productId, variationId, success: false, message: "Product not found" });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Bulk stock update processed",
      data: results,
    });
  }
);

