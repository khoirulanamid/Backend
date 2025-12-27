import { Router } from 'express';
import { TenantController } from '../controllers/TenantController';
import { verifyToken, requirePenghuni } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// All tenant routes require token + penghuni role
router.use(verifyToken, requirePenghuni);

// Tagihan
router.get('/tagihan/active', TenantController.getActiveTagihan);
router.get('/tagihan/history', TenantController.getTagihanHistory);
router.post('/tagihan/:id/bayar', upload.single('bukti'), TenantController.uploadPaymentProof);

// Laporan
router.get('/laporan', TenantController.getMyLaporan);
router.post('/laporan', upload.single('foto'), TenantController.createLaporan);

export default router;
