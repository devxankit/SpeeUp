import { Request, Response } from "express";
import Delivery from "../../../models/Delivery";
import {
  sendCallOtp as sendCallOtpService,
  verifyCallOtp as verifyCallOtpService,
} from "../../../services/otpService";
import { generateToken } from "../../../services/jwtService";
import { asyncHandler } from "../../../utils/asyncHandler";
// import { uploadDocument } from "../../../services/uploadService"; // File does not exist

/**
 * Send Call OTP to delivery mobile number
 */
export const sendCallOtp = asyncHandler(async (req: Request, res: Response) => {
  const { mobile } = req.body;

  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit mobile number is required",
    });
  }

  // Check if delivery partner exists with this mobile
  const delivery = await Delivery.findOne({ mobile });
  if (!delivery) {
    console.log('Delivery partner not found for mobile:', mobile);
    return res.status(400).json({ // Changed to 400 to distinguish from Route Not Found
      success: false,
      message: "Delivery partner not found with this mobile number. Please register first.",
    });
  }

  // Send Call OTP
  const result = await sendCallOtpService(mobile, 'Delivery');

  return res.status(200).json({
    success: true,
    message: result.message,
    sessionId: result.sessionId,
  });
});

/**
 * Verify Call OTP and login delivery partner
 */
export const verifyCallOtp = asyncHandler(async (req: Request, res: Response) => {
  const { mobile, otp, sessionId } = req.body;

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

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "Session ID is required"
    });
  }

  // Verify OTP
  console.log('Verifying OTP:', { mobile, otp, sessionId });
  const isValid = await verifyCallOtpService(sessionId, otp, mobile, 'Delivery');
  console.log('OTP Verification Result:', isValid);

  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  // Find delivery partner
  console.log('Looking for Delivery Partner with mobile:', mobile);
  const delivery = await Delivery.findOne({ mobile }).select("-password");

  if (delivery) {
    console.log('Delivery Partner Found:', delivery._id);
    console.log('ID Type:', typeof delivery._id);
    try {
      console.log('ID Constructor:', delivery._id.constructor.name);
      console.log('Is Mongoose ObjectId:', delivery._id instanceof require('mongoose').Types.ObjectId);
    } catch (e) { console.log('Could not check constructor'); }
  } else {
    console.log('Delivery Partner Found: No');
  }

  if (!delivery) {
    console.log('Error: Delivery Partner not found in DB');
    return res.status(401).json({ // Changed to 401
      success: false,
      message: "Delivery partner not found. Please Register first.",
    });
  }

  // Generate JWT token
  const token = generateToken(delivery._id.toString(), "Delivery");

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: delivery._id,
        name: delivery.name,
        mobile: delivery.mobile,
        email: delivery.email,
        city: delivery.city,
        status: delivery.status,
      },
    },
  });
});

/**
 * Register new delivery partner
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    mobile,
    email,
    dateOfBirth,
    password,
    address,
    city,
    pincode,
    drivingLicense,
    nationalIdentityCard,
    accountName,
    bankName,
    accountNumber,
    ifscCode,
    bonusType,
  } = req.body;

  // Validation
  if (!name || !mobile || !email || !password || !address || !city) {
    return res.status(400).json({
      success: false,
      message: "Name, mobile, email, password, address, and city are required",
    });
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit mobile number is required",
    });
  }

  // Check if delivery partner already exists
  const existingDelivery = await Delivery.findOne({
    $or: [{ mobile }, { email }],
  });

  if (existingDelivery) {
    return res.status(409).json({
      success: false,
      message: "Delivery partner already exists with this mobile or email",
    });
  }

  // Create new delivery partner
  await Delivery.create({
    name,
    mobile,
    email,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    password,
    address,
    city,
    pincode,
    drivingLicense,
    nationalIdentityCard,
    accountName,
    bankName,
    accountNumber,
    ifscCode,
    bonusType,
    status: "Inactive", // New delivery partners start as Inactive
    balance: 0,
    cashCollected: 0,
  } as any);

  // Generate token (Optional: usually registration doesn't login immediately if approval needed, but for seamless UX we can)
  // However, FE Flow: Register -> OTP -> Login. So we return success, then FE calls sendCallOtp.

  return res.status(201).json({
    success: true,
    message: "Delivery partner registered successfully.",
    // No token returned here, flow continues to OTP
  });
});

/**
 * Get current delivery partner profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore - req.user is added by middleware
  const userId = (req.user as any).userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  const delivery = await Delivery.findById(userId).select("-password");

  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: "Delivery partner not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: delivery,
  });
});
