"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePenghuni = exports.requireAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'atlas-kos-secret-key-change-in-production';
const N8N_API_KEY = process.env.N8N_API_KEY;
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token tidak ditemukan' });
        }
        const token = authHeader.split(' ')[1];
        // Check if it's the N8N API key (for automation)
        if (N8N_API_KEY && token === N8N_API_KEY) {
            req.user = {
                uid: 'n8n-automation',
                email: 'n8n@atlas-kos.my.id',
                role: 'ADMIN'
            };
            return next();
        }
        // Verify JWT token
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = {
                uid: decoded.uid,
                email: decoded.email,
                role: decoded.role
            };
            return next();
        }
        catch (jwtError) {
            return res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.verifyToken = verifyToken;
// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang diizinkan.' });
    }
    return next();
};
exports.requireAdmin = requireAdmin;
// Middleware to check if user is penghuni (tenant)
const requirePenghuni = (req, res, next) => {
    if (req.user?.role !== 'PENGHUNI' && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Akses ditolak.' });
    }
    return next();
};
exports.requirePenghuni = requirePenghuni;
//# sourceMappingURL=auth.js.map