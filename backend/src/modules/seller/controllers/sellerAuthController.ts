import { Request, Response } from "express";
import Seller from "../../../models/Seller";
import {
  sendOTP as sendOTPService,
  verifyOTP as verifyOTPService,
} from "../../../services/otpService";
import { generateToken } from "../../../services/jwtService";
import { asyncHandler } from "../../../utils/asyncHandler";

/**
 * Send OTP to seller mobile number
 */
export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { mobile } = req.body;

  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit mobile number is required",
    });
  }

  // Check if seller exists with this mobile
  const seller = await Seller.findOne({ mobile });
  if (!seller) {
    return res.status(404).json({
      success: false,
      message: "Seller not found with this mobile number",
    });
  }

  // Send OTP - for login, always use default OTP
  const result = await sendOTPService(mobile, "Seller", true);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * Verify OTP and login seller
 */
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { mobile, otp } = req.body;

  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit mobile number is required",
    });
  }

  if (!otp || !/^[0-9]{4}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "Valid 4-digit OTP is required",
    });
  }

  // Verify OTP
  const isValid = await verifyOTPService(mobile, otp, "Seller");
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  // Find seller
  const seller = await Seller.findOne({ mobile }).select("-password");
  if (!seller) {
    return res.status(404).json({
      success: false,
      message: "Seller not found",
    });
  }

  // Generate JWT token
  const token = generateToken(seller._id.toString(), "Seller");

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: seller._id,
        sellerName: seller.sellerName,
        mobile: seller.mobile,
        email: seller.email,
        storeName: seller.storeName,
        status: seller.status,
        logo: seller.logo,
        address: seller.address,
        city: seller.city,
      },
    },
  });
});

/**
 * Register new seller
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    sellerName,
    mobile,
    email,
    storeName,
    category,
    address,
    city,
    serviceableArea,
  } = req.body;

  // Validation (password removed - sellers don't need password during signup)
  if (
    !sellerName ||
    !mobile ||
    !email ||
    !storeName ||
    !category ||
    !address ||
    !city
  ) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided",
    });
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit mobile number is required",
    });
  }

  // Validate location is provided
  const latitude = req.body.latitude ? parseFloat(req.body.latitude) : null;
  const longitude = req.body.longitude ? parseFloat(req.body.longitude) : null;
  const serviceRadiusKm = req.body.serviceRadiusKm ? parseFloat(req.body.serviceRadiusKm) : 10; // Default 10km

  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      message: "Store location (latitude and longitude) is required. Please select location on map.",
    });
  }

  // Validate latitude and longitude ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      message: "Invalid location coordinates",
    });
  }

  // Validate service radius
  if (serviceRadiusKm < 0.1 || serviceRadiusKm > 100) {
    return res.status(400).json({
      success: false,
      message: "Service radius must be between 0.1 and 100 kilometers",
    });
  }

  // Check if seller already exists
  const existingSeller = await Seller.findOne({
    $or: [{ mobile }, { email }],
  });

  if (existingSeller) {
    return res.status(409).json({
      success: false,
      message: "Seller already exists with this mobile or email",
    });
  }

  // Create GeoJSON location point [longitude, latitude]
  const location = {
    type: 'Point' as const,
    coordinates: [longitude, latitude],
  };

  // Create new seller with GeoJSON location (password not required during signup)
  const seller = await Seller.create({
    sellerName,
    mobile,
    email,
    // password field removed - sellers don't need password during signup
    storeName,
    category,
    address,
    city,
    ...(serviceableArea && { serviceableArea }),
    searchLocation: req.body.searchLocation,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    location, // GeoJSON location for geospatial queries
    serviceRadiusKm, // Service radius in kilometers
    status: "Pending",
    requireProductApproval: false,
    viewCustomerDetails: false,
    commission: 0,
    balance: 0,
    categories: req.body.categories || [],
  });

  // Generate token
  const token = generateToken(seller._id.toString(), "Seller");

  return res.status(201).json({
    success: true,
    message: "Seller registered successfully. Awaiting admin approval.",
    data: {
      token,
      user: {
        id: seller._id,
        sellerName: seller.sellerName,
        mobile: seller.mobile,
        email: seller.email,
        storeName: seller.storeName,
        status: seller.status,
        address: seller.address,
        city: seller.city,
      },
    },
  });
});

/**
 * Get seller's profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const sellerId = (req as any).user.userId;

  const seller = await Seller.findById(sellerId).select("-password");
  if (!seller) {
    return res.status(404).json({
      success: false,
      message: "Seller not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: seller,
  });
});

/**
 * Update seller's profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const sellerId = (req as any).user.userId;
  const updates = req.body;

  // Prevent updating sensitive fields directly
  const restrictedFields = ["password", "mobile", "email", "status", "balance"];
  restrictedFields.forEach((field) => delete updates[field]);

  const seller = await Seller.findByIdAndUpdate(sellerId, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!seller) {
    return res.status(404).json({
      success: false,
      message: "Seller not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: seller,
  });
});
