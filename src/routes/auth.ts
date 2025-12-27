import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Public routes (still need token for Firebase UID)
router.post('/sync', verifyToken, AuthController.syncUser);

// Protected routes
router.get('/profile', verifyToken, AuthController.getProfile);
router.put('/profile', verifyToken, AuthController.updateProfile);

export default router;
