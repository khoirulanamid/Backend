import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { verifyToken, requireAdmin } from '../middlewares/auth';

const router = Router();

// All admin routes require token + admin role
router.use(verifyToken, requireAdmin);

// Dashboard & Settings
router.get('/stats', AdminController.getStats);
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

// Penghuni Management
router.get('/penghuni', AdminController.listPenghuni);
router.post('/penghuni', AdminController.createPenghuni);

// Pembayaran Verification
router.get('/pembayaran/pending', AdminController.listPendingPayments);
router.post('/pembayaran/:id/confirm', AdminController.confirmPayment);

// Laporan Management
router.get('/laporan', AdminController.listLaporan);
router.put('/laporan/:id/status', AdminController.updateLaporanStatus);

export default router;
