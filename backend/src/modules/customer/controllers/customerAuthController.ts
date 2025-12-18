import { Request, Response } from "express";
import Customer from "../../../models/Customer";
import {
  sendOTP as sendOTPService,
  verifyOTP as verifyOTPService,
} from "../../../services/otpService";
import { generateToken } from "../../../services/jwtService";
import { asyncHandler } from "../../../utils/asyncHandler";

/**
 * Send OTP to customer mobile number
 */
export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { mobile } = req.body;

  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit mobile number is required",
    });
  }

  // Check if customer exists with this mobile
  const customer = await Customer.findOne({ phone: mobile });
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found with this mobile number",
    });
  }

  // Send OTP - for login, always use default OTP
  const result = await sendOTPService(mobile, "Customer", true);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * Verify OTP and login customer
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
  const isValid = await verifyOTPService(mobile, otp, "Customer");
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
