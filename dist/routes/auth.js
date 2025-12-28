"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Public routes (still need token for Firebase UID)
router.post('/sync', auth_1.verifyToken, AuthController_1.AuthController.syncUser);
// Protected routes
router.get('/profile', auth_1.verifyToken, AuthController_1.AuthController.getProfile);
router.put('/profile', auth_1.verifyToken, AuthController_1.AuthController.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map