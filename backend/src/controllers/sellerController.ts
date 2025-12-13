import { Request, Response } from 'express';
import Seller from '../models/Seller';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Get all sellers (Admin only)
 */
export const getAllSellers = asyncHandler(async (req: Request, res: Response) => {
  const { status, search } = req.query;

  // Build query
  const query: any = {};
  if (status) {
    query.status = status;
  }
  if (search) {
    query.$or = [
      { sellerName: { $regex: search, $options: 'i' } },
      { storeName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
    ];
  }

  const sellers = await Seller.find(query)
    .select('-password') // Exclude password
    .sort({ createdAt: -1 }); // Sort by newest first

  return res.status(200).json({
    success: true,
    message: 'Sellers fetched successfully',
    data: sellers,
  });
});

/**
 * Get seller by ID
 */
export const getSellerById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const seller = await Seller.findById(id).select('-password');

  if (!seller) {
    return res.status(404).json({
      success: false,
      message: 'Seller not found',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Seller fetched successfully',
    data: seller,
  });
});

/**
 * Update seller status (Approve/Reject)
 */
export const updateSellerStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Approved', 'Pending', 'Rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Valid status is required (Approved, Pending, or Rejected)',
    });
  }

  const seller = await Seller.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).select('-password');

  if (!seller) {
    return res.status(404).json({
      success: false,
      message: 'Seller not found',
    });
  }

  return res.status(200).json({
    success: true,
    message: `Seller status updated to ${status}`,
    data: seller,
  });
});

/**
 * Update seller details
 */
export const updateSeller = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remove password from update data if present
  delete updateData.password;

  const seller = await Seller.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!seller) {
    return res.status(404).json({
      success: false,
      message: 'Seller not found',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Seller updated successfully',
    data: seller,
  });
});

/**
 * Delete seller
 */
export const deleteSeller = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const seller = await Seller.findByIdAndDelete(id);

  if (!seller) {
    return res.status(404).json({
      success: false,
      message: 'Seller not found',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Seller deleted successfully',
  });
});

