import { Router, Request, Response } from "express";
import { authenticate, requireUserType } from "../middleware/auth";
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadDocument,
  uploadMultipleDocuments,
  handleUploadError,
} from "../middleware/upload";
import {
  uploadImageFromBuffer,
  uploadDocumentFromBuffer,
  deleteImage,
  CLOUDINARY_FOLDERS,
} from "../services/cloudinaryService";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// All upload routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/upload/image
 * Upload a single image
 */
router.post(
  "/image",
  requireUserType("Admin", "Seller"),
  uploadSingleImage.single("image"),
  handleUploadError,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const folder = (req.body.folder as string) || CLOUDINARY_FOLDERS.PRODUCTS;
    const result = await uploadImageFromBuffer(req.file.buffer, {
      folder,
      resourceType: "image",
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  })
);

/**
 * POST /api/v1/upload/images
 * Upload multiple images
 */
router.post(
  "/images",
  requireUserType("Admin", "Seller"),
  uploadMultipleImages.array("images", 10), // Max 10 images
  handleUploadError,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided",
      });
    }

    const folder = (req.body.folder as string) || CLOUDINARY_FOLDERS.PRODUCTS;
    const files = req.files as Express.Multer.File[];

    const uploadPromises = files.map((file) =>
      uploadImageFromBuffer(file.buffer, {
        folder,
        resourceType: "image",
      })
    );

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: results,
    });
  })
);

/**
 * POST /api/v1/upload/document
 * Upload a document (image or PDF)
 */
router.post(
  "/document",
  authenticate, // All authenticated users can upload documents
  uploadDocument.single("document"),
  handleUploadError,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file provided",
      });
    }

    // Determine folder based on user type
    let folder = CLOUDINARY_FOLDERS.SELLER_DOCUMENTS;
    const userType = (req as any).user?.userType;

    if (userType === "Delivery") {
      folder = CLOUDINARY_FOLDERS.DELIVERY_DOCUMENTS;
    } else if (userType === "Seller") {
      folder = CLOUDINARY_FOLDERS.SELLER_DOCUMENTS;
    }

    // Check if it's an image or PDF
    const isImage = req.file.mimetype.startsWith("image/");
    const resourceType = isImage ? "image" : "raw";

    const result = await uploadDocumentFromBuffer(req.file.buffer, {
      folder,
      resourceType,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  })
);

/**
 * POST /api/v1/upload/documents
 * Upload multiple documents
 */
router.post(
  "/documents",
  authenticate,
  uploadMultipleDocuments.array("documents", 5), // Max 5 documents
  handleUploadError,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No document files provided",
      });
    }

    // Determine folder based on user type
    let folder = CLOUDINARY_FOLDERS.SELLER_DOCUMENTS;
    const userType = (req as any).user?.userType;

    if (userType === "Delivery") {
      folder = CLOUDINARY_FOLDERS.DELIVERY_DOCUMENTS;
    } else if (userType === "Seller") {
      folder = CLOUDINARY_FOLDERS.SELLER_DOCUMENTS;
    }

    const files = req.files as Express.Multer.File[];

    const uploadPromises = files.map((file) => {
      const isImage = file.mimetype.startsWith("image/");
      const resourceType = isImage ? "image" : "raw";
      return uploadDocumentFromBuffer(file.buffer, {
        folder,
        resourceType,
      });
    });

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: results,
    });
  })
);

/**
 * DELETE /api/v1/upload/:publicId
 * Delete an image from Cloudinary
 */
router.delete(
  "/:publicId",
  requireUserType("Admin", "Seller"),
  asyncHandler(async (req: Request, res: Response) => {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    await deleteImage(publicId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  })
);

export default router;
