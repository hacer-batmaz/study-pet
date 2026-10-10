import { Router } from 'express';
import { getShopItems, buyItem, getUserInventory } from '../controllers/shopController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/items', authenticateToken, getShopItems);
router.post('/buy', authenticateToken, buyItem);
router.get('/inventory', authenticateToken, getUserInventory);

export default router;