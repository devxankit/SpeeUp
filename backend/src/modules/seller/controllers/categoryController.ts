import { Request, Response } from "express";
import Category from "../../../models/Category";
import Product from "../../../models/Product";
import { asyncHandler } from "../../../utils/asyncHandler";

/**
 * Get all categories (parent categories only by default)
 */
export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const { includeSubcategories, search } = req.query;

    // Build query - by default, get only parent categories (no parentId)
    const query: any = { parentId: null };

    // If includeSubcategories is true, get all categories
    if (includeSubcategories === "true") {
      delete query.parentId;
    }

    // Search filter
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const categories = await Category.find(query).sort({ name: 1 });

    // Get subcategory and product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const subcategoryCount = await Category.countDocuments({
          parentId: category._id,
        });

        const productCount = await Product.countDocuments({
          categoryId: category._id,
        });

        return {
          ...category.toObject(),
          totalSubcategory: subcategoryCount,
          totalProduct: productCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categoriesWithCounts,
    });
  }
);

/**
 * Get category by ID
 */
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Get counts
    const subcategoryCount = await Category.countDocuments({
      parentId: category._id,
    });

    const productCount = await Product.countDocuments({
      categoryId: category._id,
    });

    const categoryWithCounts = {
      ...category.toObject(),
      totalSubcategory: subcategoryCount,
      totalProduct: productCount,
    };

    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: categoryWithCounts,
    });
  }
);

/**
 * Get subcategories by parent category ID
 */
export const getSubcategories = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { search, page = "1", limit = "10", sortBy = "name", sortOrder = "asc" } = req.query;

    // Verify parent category exists
    const parentCategory = await Category.findById(id);
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
    }

    // Build query
    const query: any = { parentId: id };

    // Search filter
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const subcategories = await Category.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get product counts for each subcategory
    const subcategoriesWithCounts = await Promise.all(
      subcategories.map(async (subcategory) => {
        const productCount = await Product.countDocuments({
          subcategoryId: subcategory._id,
        });

        return {
          ...subcategory.toObject(),
          categoryName: parentCategory.name,
          totalProduct: productCount,
        };
      })
    );

    const total = await Category.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      data: subcategoriesWithCounts,
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
 * Get all categories with their subcategories nested
 */
export const getAllCategoriesWithSubcategories = asyncHandler(
  async (req: Request, res: Response) => {
    // Get all parent categories
    const parentCategories = await Category.find({ parentId: null }).sort({ name: 1 });

    // Get all subcategories grouped by parent
    const categoriesWithSubcategories = await Promise.all(
      parentCategories.map(async (category) => {
        const subcategories = await Category.find({ parentId: category._id }).sort({ name: 1 });

        // Get product counts
        const subcategoriesWithCounts = await Promise.all(
          subcategories.map(async (subcategory) => {
            const productCount = await Product.countDocuments({
              subcategoryId: subcategory._id,
            });

            return {
              ...subcategory.toObject(),
              totalProduct: productCount,
            };
          })
        );

        const subcategoryCount = subcategories.length;
        const productCount = await Product.countDocuments({
          categoryId: category._id,
        });

        return {
          ...category.toObject(),
          totalSubcategory: subcategoryCount,
          totalProduct: productCount,
          subcategories: subcategoriesWithCounts,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Categories with subcategories fetched successfully",
      data: categoriesWithSubcategories,
    });
  }
);

/**
 * Get all subcategories (across all categories)
 */
export const getAllSubcategories = asyncHandler(
  async (req: Request, res: Response) => {
    const { search, page = "1", limit = "10", sortBy = "name", sortOrder = "asc" } = req.query;

    // Build query - get all categories with parentId
    const query: any = { parentId: { $ne: null } };

    // Search filter
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const subcategories = await Category.find(query)
      .populate("parentId", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get product counts and format response
    const subcategoriesWithCounts = await Promise.all(
      subcategories.map(async (subcategory) => {
        const productCount = await Product.countDocuments({
          subcategoryId: subcategory._id,
        });

        const parentCategory = subcategory.parentId as any;

        return {
          id: subcategory._id,
          categoryName: parentCategory?.name || "",
          subcategoryName: subcategory.name,
          subcategoryImage: subcategory.imageUrl || "",
          totalProduct: productCount,
        };
      })
    );

    const total = await Category.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      data: subcategoriesWithCounts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);

