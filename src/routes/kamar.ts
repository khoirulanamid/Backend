import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Kamar routes - accessible by all authenticated users
router.get('/', verifyToken, AdminController.listKamar);

// Admin-only kamar management
router.post('/', verifyToken, AdminController.createKamar);
router.put('/:id', verifyToken, AdminController.updateKamar);

export default router;
