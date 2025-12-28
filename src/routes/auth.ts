import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Public routes (no auth required)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes (require JWT token)
router.get('/profile', verifyToken, AuthController.getProfile);
router.put('/profile', verifyToken, AuthController.updateProfile);

export default router;
