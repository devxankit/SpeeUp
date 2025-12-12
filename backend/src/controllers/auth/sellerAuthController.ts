import { Request, Response } from 'express';
import Seller from '../../models/Seller';
import { sendOTP as sendOTPService, verifyOTP as verifyOTPService } from '../../services/otpService';
import { generateToken } from '../../services/jwtService';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * Send OTP to seller mobile number
 */
export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { mobile } = req.body;

  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: 'Valid 10-digit mobile number is required',
    });
  }

  // Check if seller exists with this mobile
  const seller = await Seller.findOne({ mobile });
  if (!seller) {
    return res.status(404).json({
      success: false,
      message: 'Seller not found with this mobile number',
    });
  }

  // Send OTP
  const result = await sendOTPService(mobile, 'Seller');

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
      message: 'Valid 10-digit mobile number is required',
    });
  }

  if (!otp || !/^[0-9]{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: 'Valid 6-digit OTP is required',
    });
  }

  // Verify OTP
  const isValid = await verifyOTPService(mobile, otp, 'Seller');
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired OTP',
    });
  }

  // Find seller
  const seller = await Seller.findOne({ mobile }).select('-password');
  if (!seller) {
    return res.status(404).json({
      success: false,
      message: 'Seller not found',
    });
  }

  // Generate JWT token
  const token = generateToken(seller._id.toString(), 'Seller');

  return res.status(200).json({
    success: true,
    message: 'Login successful',
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
    password,
    storeName,
    category,
    address,
    city,
    serviceableArea,
  } = req.body;

  // Validation
  if (!sellerName || !mobile || !email || !password || !storeName || !category || !address || !city || !serviceableArea) {
    return res.status(400).json({
      success: false,
      message: 'All required fields must be provided',
    });
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: 'Valid 10-digit mobile number is required',
    });
  }

  // Check if seller already exists
  const existingSeller = await Seller.findOne({
    $or: [{ mobile }, { email }],
  });

  if (existingSeller) {
    return res.status(409).json({
      success: false,
      message: 'Seller already exists with this mobile or email',
    });
  }

  // Create new seller
  const seller = await Seller.create({
    sellerName,
    mobile,
    email,
    password,
    storeName,
    category,
    address,
    city,
    serviceableArea,
    status: 'Pending',
    requireProductApproval: false,
    viewCustomerDetails: false,
    commission: 0,
    balance: 0,
    categories: [],
  });

  // Generate token
  const token = generateToken(seller._id.toString(), 'Seller');

  return res.status(201).json({
    success: true,
    message: 'Seller registered successfully. Awaiting admin approval.',
    data: {
      token,
      user: {
        id: seller._id,
        sellerName: seller.sellerName,
        mobile: seller.mobile,
        email: seller.email,
        storeName: seller.storeName,
        status: seller.status,
      },
    },
  });
});

