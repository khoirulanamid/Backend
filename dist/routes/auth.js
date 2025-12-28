"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Public routes (no auth required)
router.post('/register', AuthController_1.AuthController.register);
router.post('/login', AuthController_1.AuthController.login);
// Protected routes (require JWT token)
router.get('/profile', auth_1.verifyToken, AuthController_1.AuthController.getProfile);
router.put('/profile', auth_1.verifyToken, AuthController_1.AuthController.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map