import { Request, Response } from 'express';
import Tax from '../../../models/Tax';
import { asyncHandler } from '../../../utils/asyncHandler';

/**
 * Get all active tax rates
 */
export const getActiveTaxes = asyncHandler(async (req: Request, res: Response) => {
    const taxes = await Tax.find({ isActive: true }).sort({ name: 1 });

    return res.status(200).json({
        success: true,
        data: taxes
    });
});

/**
 * Get all taxes (for management)
 */
export const getAllTaxes = asyncHandler(async (req: Request, res: Response) => {
    const taxes = await Tax.find().sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        data: taxes
    });
});

/**
 * Create a new tax rate (Admin only usually, but providing for setup)
 */
export const createTax = asyncHandler(async (req: Request, res: Response) => {
    const { name, rate, type, description } = req.body;

    const tax = await Tax.create({
        name,
        rate,
        type,
        description
    });

    return res.status(201).json({
        success: true,
        message: 'Tax rate created successfully',
        data: tax
    });
});

/**
 * Update tax status
 */
export const updateTaxStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const tax = await Tax.findByIdAndUpdate(id, { isActive }, { new: true });

    if (!tax) {
        return res.status(404).json({ success: false, message: 'Tax not found' });
    }

    return res.status(200).json({
        success: true,
        message: 'Tax status updated successfully',
        data: tax
    });
});
