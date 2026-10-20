import { Router } from 'express';
import { 
  getAdminStats, 
  getAllUsers, 
  updateUserStatus, 
  createUserByAdmin,
  getAdminShopItems, 
  createShopItem, 
  toggleShopItem, 
  getAdminLogs 
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/stats', getAdminStats);

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.post('/users', createUserByAdmin);
router.get('/shop', getAdminShopItems);
router.post('/shop', createShopItem);
router.put('/shop/:id/toggle', toggleShopItem);

router.get('/logs', getAdminLogs);

export default router;