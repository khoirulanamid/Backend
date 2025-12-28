"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TenantController_1 = require("../controllers/TenantController");
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
// All tenant routes require token + penghuni role
router.use(auth_1.verifyToken, auth_1.requirePenghuni);
// Tagihan
router.get('/tagihan/active', TenantController_1.TenantController.getActiveTagihan);
router.get('/tagihan/history', TenantController_1.TenantController.getTagihanHistory);
router.post('/tagihan/:id/bayar', upload_1.upload.single('bukti'), TenantController_1.TenantController.uploadPaymentProof);
// Laporan
router.get('/laporan', TenantController_1.TenantController.getMyLaporan);
router.post('/laporan', upload_1.upload.single('foto'), TenantController_1.TenantController.createLaporan);
exports.default = router;
//# sourceMappingURL=penghuni.js.map