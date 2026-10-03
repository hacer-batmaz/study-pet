import { Router } from 'express';
import { getShopItems, buyItem } from '../controllers/shopController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/items', authenticateToken, getShopItems);
router.post('/buy', authenticateToken, buyItem);

export default router;