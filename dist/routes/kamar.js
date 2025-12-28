"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Kamar routes - accessible by all authenticated users
router.get('/', auth_1.verifyToken, AdminController_1.AdminController.listKamar);
// Admin-only kamar management
router.post('/', auth_1.verifyToken, AdminController_1.AdminController.createKamar);
router.put('/:id', auth_1.verifyToken, AdminController_1.AdminController.updateKamar);
exports.default = router;
//# sourceMappingURL=kamar.js.map