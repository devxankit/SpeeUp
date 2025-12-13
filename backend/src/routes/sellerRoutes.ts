import { Router } from 'express';
import {
  getAllSellers,
  getSellerById,
  updateSellerStatus,
  updateSeller,
  deleteSeller,
} from '../controllers/sellerController';
import { authenticate, requireUserType, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin user type
router.use(authenticate);
router.use(requireUserType('Admin'));

// Get all sellers
router.get('/', getAllSellers);

// Get seller by ID
router.get('/:id', getSellerById);

// Update seller status
router.patch('/:id/status', updateSellerStatus);

// Update seller details
router.put('/:id', updateSeller);

// Delete seller
router.delete('/:id', deleteSeller);

export default router;

