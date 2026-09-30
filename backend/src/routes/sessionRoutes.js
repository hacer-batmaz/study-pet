import { Router } from 'express';
import { startSession, completeSession, abandonSession } from '../controllers/sessionController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/start', authenticateToken, startSession);
router.post('/complete', authenticateToken, completeSession);
router.post('/abandon', authenticateToken, abandonSession);

export default router;