import { Request, Response } from "express";
import Return from "../../../models/Return";
import Order from "../../../models/Order";
import OrderItem from "../../../models/OrderItem";
import { asyncHandler } from "../../../utils/asyncHandler";

/**
 * Get seller's return requests with filters, sorting, and pagination
 */
export const getReturnRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.id;
    const {
      dateFrom,
      dateTo,
      status,
      search,
      page = "1",
      limit = "10",
      sortBy = "returnDate",
      sortOrder = "desc",
    } = req.query;

    // Build query - filter by authenticated seller
    const query: any = { sellerId };

    // Date range filter
    if (dateFrom || dateTo) {
      query.returnDate = {};
      if (dateFrom) {
        query.returnDate.$gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        query.returnDate.$lte = new Date(dateTo as string);
      }
    }

    // Status filter
    if (status && status !== 'All Status') {
      query.status = status;
    }

    // Search filter
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } },
        { variantTitle: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    // Get returns with populated order and order item info
    const returns = await Return.find(query)
      .populate("orderId", "orderId deliveryDate")
      .populate("customerId", "name phone")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Return.countDocuments(query);

    // Format response for frontend
    const formattedReturns = returns.map(returnItem => ({
      id: returnItem._id,
      orderItemId: returnItem.orderItemId.toString(),
      product: returnItem.productName,
      variant: returnItem.variantTitle,
      price: returnItem.price,
      discPrice: returnItem.discPrice,
      quantity: returnItem.quantity,
      total: returnItem.total,
      status: returnItem.status,
      date: returnItem.returnDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      customerName: (returnItem.customerId as any)?.name || '',
      customerPhone: (returnItem.customerId as any)?.phone || '',
      orderId: (returnItem.orderId as any)?.orderId || '',
    }));

    return res.status(200).json({
      success: true,
      message: "Return requests fetched successfully",
      data: formattedReturns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);

/**
 * Get return request by ID with populated order and order item details
 */
export const getReturnRequestById = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.id;
    const { id } = req.params;

    // Get return request with populated data
    const returnRequest = await Return.findOne({ _id: id, sellerId })
      .populate("orderId", "orderId deliveryDate paymentMethod")
      .populate("orderItemId")
      .populate("customerId", "name email phone");

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    // Format response for frontend
    const returnDetail = {
      id: returnRequest._id,
      orderId: (returnRequest.orderId as any)?.orderId || '',
      orderItemId: returnRequest.orderItemId._id.toString(),
      productName: returnRequest.productName,
      variantTitle: returnRequest.variantTitle,
      price: returnRequest.price,
      discPrice: returnRequest.discPrice,
      quantity: returnRequest.quantity,
      total: returnRequest.total,
      status: returnRequest.status,
      returnDate: returnRequest.returnDate.toISOString().split('T')[0],
      processedDate: returnRequest.processedDate?.toISOString().split('T')[0],
      reason: returnRequest.reason || '',
      customerName: (returnRequest.customerId as any)?.name || '',
      customerEmail: (returnRequest.customerId as any)?.email || '',
      customerPhone: (returnRequest.customerId as any)?.phone || '',
    };

    return res.status(200).json({
      success: true,
      message: "Return request details fetched successfully",
      data: returnDetail,
    });
  }
);

/**
 * Update return request status (Approved, Rejected, Completed)
 */
export const updateReturnStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const sellerId = (req as any).user.id;
    const { id } = req.params;
    const { status } = req.body;

    // Validate allowed status updates for seller
    const allowedStatuses = ['Approved', 'Rejected', 'Completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses: ${allowedStatuses.join(', ')}`,
      });
    }

    // Prepare update data
    const updateData: any = { status };
    if (status === 'Approved' || status === 'Rejected' || status === 'Completed') {
      updateData.processedDate = new Date();
    }

    // Find and update return request
    const returnRequest = await Return.findOneAndUpdate(
      { _id: id, sellerId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Return request status updated successfully",
      data: {
        id: returnRequest._id,
        status: returnRequest.status,
        processedDate: returnRequest.processedDate,
      },
    });
  }
);
