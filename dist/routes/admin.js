"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// All admin routes require token + admin role
router.use(auth_1.verifyToken, auth_1.requireAdmin);
// Dashboard & Settings
router.get('/stats', AdminController_1.AdminController.getStats);
router.get('/settings', AdminController_1.AdminController.getSettings);
router.put('/settings', AdminController_1.AdminController.updateSettings);
// Penghuni Management
router.get('/penghuni', AdminController_1.AdminController.listPenghuni);
router.post('/penghuni', AdminController_1.AdminController.createPenghuni);
// Pembayaran Verification
router.get('/pembayaran/pending', AdminController_1.AdminController.listPendingPayments);
router.post('/pembayaran/:id/confirm', AdminController_1.AdminController.confirmPayment);
// Laporan Management
router.get('/laporan', AdminController_1.AdminController.listLaporan);
router.put('/laporan/:id/status', AdminController_1.AdminController.updateLaporanStatus);
exports.default = router;
//# sourceMappingURL=admin.js.map