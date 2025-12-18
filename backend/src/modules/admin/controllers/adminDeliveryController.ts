import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import Delivery from "../../../models/Delivery";
import DeliveryAssignment from "../../../models/DeliveryAssignment";
import Order from "../../../models/Order";

/**
 * Create a new delivery boy
 */
export const createDeliveryBoy = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      mobile,
      email,
      password,
      dateOfBirth,
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

    if (!name || !mobile || !email || !password || !address || !city) {
      return res.status(400).json({
        success: false,
        message:
          "Name, mobile, email, password, address, and city are required",
      });
    }

    const deliveryBoy = await Delivery.create({
      name,
      mobile,
      email,
      password,
      dateOfBirth,
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
      status: "Inactive", // New delivery boys start as inactive
    });

    return res.status(201).json({
      success: true,
      message: "Delivery boy created successfully",
      data: deliveryBoy,
    });
  }
);

/**
 * Get all delivery boys
 */
export const getAllDeliveryBoys = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: "i" } },
        { mobile: { $regex: search as string, $options: "i" } },
        { email: { $regex: search as string, $options: "i" } },
      ];
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [deliveryBoys, total] = await Promise.all([
      Delivery.find(query)
        .select("-password")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit as string)),
      Delivery.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Delivery boys fetched successfully",
      data: deliveryBoys,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  }
);

/**
 * Get delivery boy by ID
 */
export const getDeliveryBoyById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const deliveryBoy = await Delivery.findById(id).select("-password");

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Delivery boy fetched successfully",
      data: deliveryBoy,
    });
  }
);

/**
 * Update delivery boy
 */
export const updateDeliveryBoy = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow password update through this endpoint
    delete updateData.password;

    const deliveryBoy = await Delivery.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Delivery boy updated successfully",
      data: deliveryBoy,
    });
  }
);

/**
 * Update delivery boy status
 */
export const updateDeliveryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Active or Inactive",
      });
    }

    const deliveryBoy = await Delivery.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Delivery boy status updated successfully",
      data: deliveryBoy,
    });
  }
);

/**
 * Get delivery assignments
 */
export const getDeliveryAssignments = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params; // Delivery boy ID
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { deliveryBoy: id };
    if (status) query.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [assignments, total] = await Promise.all([
      DeliveryAssignment.find(query)
        .populate("order")
        .populate("assignedBy", "firstName lastName")
        .sort({ assignedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      DeliveryAssignment.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Delivery assignments fetched successfully",
      data: assignments,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  }
);

/**
 * Collect cash from delivery boy
 */
export const collectCash = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // Delivery boy ID
  const { amount, notes } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid amount is required",
    });
  }

  const deliveryBoy = await Delivery.findById(id);
  if (!deliveryBoy) {
    return res.status(404).json({
      success: false,
      message: "Delivery boy not found",
    });
  }

  if (deliveryBoy.cashCollected < amount) {
    return res.status(400).json({
      success: false,
      message: "Amount exceeds cash collected",
    });
  }

  // Update cash collected
  deliveryBoy.cashCollected -= amount;
  deliveryBoy.balance += amount; // Add to balance
  await deliveryBoy.save();

  return res.status(200).json({
    success: true,
    message: "Cash collected successfully",
    data: {
      deliveryBoy: deliveryBoy.toObject(),
      transaction: {
        amount,
        notes,
        previousCashCollected: deliveryBoy.cashCollected + amount,
        newCashCollected: deliveryBoy.cashCollected,
        previousBalance: deliveryBoy.balance - amount,
        newBalance: deliveryBoy.balance,
      },
    },
  });
});
