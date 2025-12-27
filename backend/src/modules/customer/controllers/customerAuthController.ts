import { Request, Response } from "express";
import Customer from "../../../models/Customer";
import {
  sendCallOtp as sendCallOtpService,
  verifyCallOtp as verifyCallOtpService,
} from "../../../services/otpService";
import { generateToken } from "../../../services/jwtService";
import { asyncHandler } from "../../../utils/asyncHandler";

/**
 * Send Call OTP to customer mobile number
 * Returns session_id for verification
 */
export const sendCallOtp = asyncHandler(async (req: Request, res: Response) => {
  const { mobile } = req.body;

  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit mobile number is required",
    });
  }

  // Check if customer exists with this mobile (Login Flow)
  // Note: For Signup, we might need a separate flow or allow if not found?
  // The user didn't specify distinct signup/login flows for call OTP, but existing code checks customer.
  // Standard practice: if checking for login, user must exist.
  // We will keep this check.
  const customer = await Customer.findOne({ phone: mobile });
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found. Please register first.",
    });
  }

  // Send Call OTP
  try {
    const result = await sendCallOtpService(mobile, 'Customer');

    return res.status(200).json({
      success: true,
      message: result.message,
      sessionId: result.sessionId, // Return session ID to frontend
    });
  } catch (error: any) {
    console.error('Error sending Call OTP:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send Call OTP. Please try again.',
    });
  }
});

/**
 * Verify Call OTP and login customer
 * Requires session_id and otp
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
      message: "Session ID is required for verification",
    });
  }

  // Verify Voice OTP
  const isValid = await verifyCallOtpService(sessionId, otp, mobile, 'Customer');
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  // Find customer
  const customer = await Customer.findOne({ phone: mobile });
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  // Generate JWT token
  const token = generateToken(customer._id.toString(), "Customer");

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        walletAmount: customer.walletAmount,
        refCode: customer.refCode,
        status: customer.status,
      },
    },
  });
});

/**
 * Register new customer
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, mobile, email, dateOfBirth } = req.body;

  // Validation
  if (!name || !mobile || !email) {
    return res.status(400).json({
      success: false,
      message: "Name, mobile, and email are required",
    });
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit mobile number is required",
    });
  }

  // Check if customer already exists
  const existingCustomer = await Customer.findOne({
    $or: [{ phone: mobile }, { email }],
  });

  if (existingCustomer) {
    return res.status(409).json({
      success: false,
      message: "Customer already exists with this mobile or email",
    });
  }

  // Create new customer
  const customer = await Customer.create({
    name,
    phone: mobile,
    email,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    status: "Active",
    walletAmount: 0,
    totalOrders: 0,
    totalSpent: 0,
  });

  // Generate token
  const token = generateToken(customer._id.toString(), "Customer");

  return res.status(201).json({
    success: true,
    message: "Customer registered successfully",
    data: {
      token,
      user: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        walletAmount: customer.walletAmount,
        refCode: customer.refCode,
        status: customer.status,
      },
    },
  });
});
