import { Request, Response } from 'express';
import { setCorsHeaders } from '../utils/corsHelper';

export const notFound = (req: Request, res: Response): void => {
  // Preserve CORS headers if origin is present
  setCorsHeaders(res, req.headers.origin);

  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};








