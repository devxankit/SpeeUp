import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  getSubcategories,
  getAllCategoriesWithSubcategories,
  getAllSubcategories,
} from "../modules/seller/controllers/categoryController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all categories (parent categories only by default)
router.get("/", getCategories);

// Get all subcategories (across all categories)
router.get("/subcategories", getAllSubcategories);

// Get all categories with nested subcategories
router.get("/all-with-subcategories", getAllCategoriesWithSubcategories);

// Get category by ID
router.get("/:id", getCategoryById);

// Get subcategories of a specific category
router.get("/:id/subcategories", getSubcategories);

export default router;

