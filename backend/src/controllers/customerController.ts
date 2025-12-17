import { Request, Response } from 'express';
import Customer from '../models/Customer';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Get customer profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const customer = await Customer.findById(userId);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      dateOfBirth: customer.dateOfBirth,
      registrationDate: customer.registrationDate,
      status: customer.status,
      refCode: customer.refCode,
      walletAmount: customer.walletAmount,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
    },
  });
});

/**
 * Update customer profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { name, email, dateOfBirth } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const customer = await Customer.findById(userId);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found',
    });
  }

  // Update fields if provided
  if (name) customer.name = name;
  if (email) {
    // Check if email is already taken by another customer
    const existingCustomer = await Customer.findOne({ 
      email, 
      _id: { $ne: userId } 
    });
    
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use by another customer',
      });
    }
    
    customer.email = email;
  }
  if (dateOfBirth) customer.dateOfBirth = new Date(dateOfBirth);

  await customer.save();

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      dateOfBirth: customer.dateOfBirth,
      registrationDate: customer.registrationDate,
      status: customer.status,
      refCode: customer.refCode,
      walletAmount: customer.walletAmount,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
    },
  });
});

