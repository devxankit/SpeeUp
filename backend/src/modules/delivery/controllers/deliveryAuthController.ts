import { Request, Response } from "express";
import Delivery from "../../../models/Delivery";
import {
  sendOTP as sendOTPService,
  verifyOTP as verifyOTPService,
} from "../../../services/otpService";
import { generateToken } from "../../../services/jwtService";
import { asyncHandler } from "../../../utils/asyncHandler";

/**
 * Send OTP to delivery mobile number
 */
export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
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
    return res.status(404).json({
      success: false,
      message: "Delivery partner not found with this mobile number",
    });
  }

  // Send OTP - for login, always use default OTP
  const result = await sendOTPService(mobile, "Delivery", true);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * Verify OTP and login delivery partner
 */
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { mobile, otp } = req.body;

  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit mobile number is required",
    });
  }

  if (!otp || !/^[0-9]{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "Valid 6-digit OTP is required",
    });
  }

  // Verify OTP
  const isValid = await verifyOTPService(mobile, otp, "Delivery");
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  // Find delivery partner
  const delivery = await Delivery.findOne({ mobile }).select("-password");
  if (!delivery) {
    return res.status(404).json({
      success: false,
      message: "Delivery partner not found",
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
  const delivery = await Delivery.create({
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
  });

  // Generate token
  const token = generateToken(delivery._id.toString(), "Delivery");

  return res.status(201).json({
    success: true,
    message:
      "Delivery partner registered successfully. Awaiting admin approval.",
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
