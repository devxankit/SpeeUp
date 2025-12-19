
import { Router } from 'express';
import { getWalletStats, getTransactions } from '../modules/customer/controllers/customerWalletController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', getWalletStats);
router.get('/transactions', getTransactions);

export default router;
